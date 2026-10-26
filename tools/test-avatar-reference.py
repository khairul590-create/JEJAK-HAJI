"""One runnable proof check: python3 tools/test-avatar-reference.py OUTPUT_DIR.
Uses installed Playwright; no changes to the live game or external writes.
"""
import sys
import json
import struct
import functools
import http.server
import threading
from pathlib import Path
from playwright.sync_api import sync_playwright


def check_glb(path):
    data=path.read_bytes()
    magic,version,total=struct.unpack_from('<4sII',data)
    assert magic==b'glTF' and version==2 and total==len(data),'Invalid GLB header'
    length,kind=struct.unpack_from('<II',data,12)
    assert kind==0x4e4f534a
    doc=json.loads(data[20:20+length])
    clips={x['name'] for x in doc.get('animations',[])}
    assert clips=={'Idle','Walk','Takbir','Rukuk','Duduk','Sujud'},clips
    assert doc.get('skins') and not doc.get('extensionsRequired'), 'Missing skin or unsupported required extension'
    assert all('uri' not in b for b in doc['buffers']), 'Unexpected external buffer'
    tris=0
    for m in doc['meshes']:
        for p in m['primitives']:
            assert p.get('mode',4)==4
            assert {'POSITION','NORMAL','JOINTS_0','WEIGHTS_0'} <= p['attributes'].keys()
            tris+=doc['accessors'][p['indices']]['count']//3
    assert len(data)<2_000_000,'Proof size exceeds 2MB ceiling'
    assert tris<15_000,'Avatar exceeds the 15k-triangle target'
    # Reject out-of-file buffer views rather than trusting a JSON-only parse.
    binary_length=struct.unpack_from('<I',data,20+length)[0]
    for view in doc['bufferViews']:
        assert view.get('byteOffset',0)+view['byteLength']<=binary_length
    return {'bytes':len(data),'triangles':tris,'clips':sorted(clips)}


def main():
    root=Path(sys.argv[1]).resolve()
    report=check_glb(root/'avatar-reference.glb')
    class Quiet(http.server.SimpleHTTPRequestHandler):
        def log_message(self,*args):pass
    server=http.server.ThreadingHTTPServer(('127.0.0.1',0),functools.partial(Quiet,directory=str(root)))
    threading.Thread(target=server.serve_forever,daemon=True).start()
    base=f'http://127.0.0.1:{server.server_port}/'
    errors=[];checks=[]
    try:
        with sync_playwright() as p:
            browser=p.chromium.launch(headless=True,args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
            for width,height in [(1200,1000),(390,844)]:
                page=browser.new_page(viewport={'width':width,'height':height},reduced_motion='reduce')
                page.on('pageerror',lambda e:errors.append(str(e)))
                page.on('console',lambda m:errors.append(m.text) if m.type=='error' else None)
                page.goto(base,wait_until='networkidle')
                page.wait_for_selector('body[data-ready="true"]',timeout=45000)
                state=page.evaluate('window.__avatarProof.getState()')
                assert state['revision']=='128' and state['triangles']==report['triangles'],state
                assert state['bones']>=16 and state['meshes']>0
                assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1')
                for angle in ['front','side','back','quarter']:
                    page.locator(f'[data-angle="{angle}"]').click()
                    pos=page.evaluate('window.__avatarProof.camera.position.toArray()')
                    checks.append({'width':width,'angle':angle,'camera':pos})
                    if width==1200:
                        page.locator('#stage').screenshot(path=str(root/f'webgl-{angle}.png'))
                page.locator('#spin').click()
                assert page.locator('#spin').get_attribute('aria-pressed')=='true'
                page.locator('#spin').click()
                assert page.locator('#spin').get_attribute('aria-pressed')=='false'
                for name in ['Idle','Walk','Takbir','Rukuk','Duduk','Sujud']:
                    page.locator('#animation').select_option(name)
                    assert page.locator('body').get_attribute('data-pose')==name
                    result=page.evaluate('''() => {
                      const p=window.__avatarProof;
                      p.mixer.setTime(.25);p.avatar.updateMatrixWorld(true);
                      let min=Infinity,max=-Infinity,finite=true,vertices=0;
                      p.avatar.traverse(o=>{if(o.isSkinnedMesh&&o.visible){
                        o.skeleton.update();
                        for(let i=0;i<o.geometry.attributes.position.count;i++){
                          const v=new THREE.Vector3().fromBufferAttribute(o.geometry.attributes.position,i);
                          o.boneTransform(i,v);v.applyMatrix4(o.matrixWorld);
                          finite=finite&&[v.x,v.y,v.z].every(Number.isFinite);
                          min=Math.min(min,v.y);max=Math.max(max,v.y);vertices++;
                        }
                      }});
                      return {finite,min,max,vertices};
                    }''')
                    assert result['finite'] and result['vertices']>0 and result['max']<2.5,result
                    assert result['min']>-.02,'Below-ground deformation: '+str(result)
                    checks.append({'width':width,'pose':name,'bounds':result})
                    if width==1200:
                        page.locator('#stage').screenshot(path=str(root/f'webgl-{name}.png'))
                assert page.locator('#pause').get_attribute('aria-pressed')=='true'
                assert page.evaluate('window.__avatarProof.getState().paused')
                page.locator('#pause').click()
                assert page.locator('#pause').get_attribute('aria-pressed')=='false'
                assert not page.evaluate('window.__avatarProof.getState().paused')
                page.locator('#pause').click()
                assert page.evaluate('window.__avatarProof.getState().paused')
                page.locator('#animation').select_option('Idle')
                with page.expect_download() as dl:
                    page.get_by_role('link',name='Muat turun GLB',exact=True).click()
                assert Path(dl.value.path()).read_bytes()==(root/'avatar-reference.glb').read_bytes()
                external=page.evaluate('performance.getEntriesByType("resource").filter(r=>r.name.startsWith("http")&&!r.name.startsWith(location.origin)).map(r=>r.name)')
                assert not external,external
                page.evaluate('scrollTo(0,0)')
                page.screenshot(path=str(root/f'preview-{width}.png'))
                page.close()
            browser.close()
        assert not errors,errors
        result={'result':'PASS','model':report,'checks':checks,'consoleErrors':errors,'scope':'WebGL loading, finite deformation, controls, download and responsive preview; not visual or religious approval, not physical phone performance'}
        (root/'verification.json').write_text(json.dumps(result,indent=2))
        print(json.dumps(result,indent=2))
    finally:server.shutdown()


if __name__=='__main__':main()
