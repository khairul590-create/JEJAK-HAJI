"""Package Blender outputs after JH_RENDER=1; contact sheet requires Pillow."""
from pathlib import Path
import zipfile
from PIL import Image, ImageDraw, ImageFont
root=Path(__file__).resolve().parents[1]
out=root/'models'
variants=['lelaki-ihram','perempuan-telekung','lelaki-biasa','perempuan-biasa']
with zipfile.ZipFile(out/'characters-blender.zip','w',zipfile.ZIP_DEFLATED,9) as z:
    for v in variants:z.write(out/(v+'.blend'),v+'.blend')
poses=['Idle','Walk','Rukuk','Duduk','Sujud','Takbir']
sheet=Image.new('RGB',(1440,1080),'#e6ece8');draw=ImageDraw.Draw(sheet)
try:font=ImageFont.truetype('DejaVuSans.ttf',22)
except OSError:font=ImageFont.load_default()
for row,v in enumerate(variants[:2]):
    for col,pose in enumerate(poses):
        x=(col%3)*480;y=(row*2+col//3)*270
        im=Image.open(out/f'{v}-{pose}.png').convert('RGB').resize((245,245))
        sheet.paste(im,(x+117,y));draw.text((x+16,y+245),('Lelaki' if row==0 else 'Perempuan')+' / '+pose,fill='#163d32',font=font)
sheet.save(out/'characters-preview.jpg',quality=90)
print(out/'characters-blender.zip');print(out/'characters-preview.jpg')
