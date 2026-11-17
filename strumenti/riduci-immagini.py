"""Versioni ridotte delle immagini del portale (17/11/2026, chiesto dall'utente:
«l'importante è che sul cell siano velocissime app servizi e visite»).

All'apertura il portale scaricava 24,8 MB di immagini: foto del personale fino a
3.788 px e 3,6 MB, testate dei servizi da 2 MB, quasi tutte in pagine nascoste.
Questo script scrive in img/ridotte/ le versioni alla misura a cui le immagini
compaiono, nel doppio per gli schermi ad alta densità (PC e telefono);
index.html le usa con srcset, e il browser sceglie quella giusta.

GLI ORIGINALI NON SI TOCCANO: restano nella radice del repository.
Il logo istituzionale grande (Formedil_Padova_Positivo_colori.png) non si
riduce: è in CMYK, e convertirlo cambierebbe i colori del marchio.

Uso (dalla radice del repo servizi):  python strumenti/riduci-immagini.py
Si rilancia quando cambia una foto: riscrive le ridotte da capo.
"""
from pathlib import Path
import io
from PIL import Image, ImageOps, ImageCms

R = Path(__file__).resolve().parent.parent
OUT = R / 'img' / 'ridotte'
OUT.mkdir(parents=True, exist_ok=True)

# foto del team: riquadro quadrato (object-fit: cover), su PC ~260 px, sul telefono ~340 px
TEAM = {
    'Andrea Pagnacco.jpg': 'team-andrea-pagnacco',
    'nicola-de marco.jpg': 'team-nicola-de-marco',
    'Renato Squizzato.jpg': 'team-renato-squizzato',
    'Camuffo Marco.jpg': 'team-marco-camuffo',
    'Caon Franco.jpg': 'team-franco-caon',
    'visentini Tommaso.jpg': 'team-tommaso-visentini',
}
# testate dei servizi: a tutta larghezza della pagina (fino a ~820 px)
TESTATE = {
    'RLST.png': 'testata-rlst',
    'CONFERENZA DI CANTIERE.png': 'testata-conferenza-di-cantiere',
    'pericolo.png': 'testata-segnalazione',
    'cantieri.png': 'testata-cantieri',
    'Servizi.png': 'testata-home-servizi',
}
# loghi mostrati a 100-110 px
LOGHI = {
    'logo_asseverazione_cpt.jpg': ('logo-asseverazione', 240),
    'logo_corsi_cpt.png': ('logo-corsi', 240),
}


def in_srgb(im):
    """Colori convertiti in sRGB col profilo incorporato, poi il profilo si toglie.
    Il logo dell'asseverazione ne aveva uno da 1,8 MB: era tutto il suo peso."""
    icc = im.info.get('icc_profile')
    if icc and im.mode in ('RGB', 'RGBA'):
        try:
            sorgente = ImageCms.ImageCmsProfile(io.BytesIO(icc))
            im = ImageCms.profileToProfile(im, sorgente, ImageCms.createProfile('sRGB'), outputMode=im.mode)
        except Exception as e:   # profilo illeggibile: si tengono i pixel come sono
            print('  profilo colore non convertito:', e)
    im.info.pop('icc_profile', None)
    return im


def rgb(im):
    im = in_srgb(ImageOps.exif_transpose(im))
    if im.mode in ('RGBA', 'LA', 'P'):
        im = im.convert('RGBA')
        fondo = Image.new('RGB', im.size, (255, 255, 255))
        fondo.paste(im, mask=im.getchannel('A'))
        return fondo
    return im.convert('RGB')


def salva_jpg(im, nome, q=82):
    p = OUT / nome
    im.info.pop('icc_profile', None)
    im.save(p, 'JPEG', quality=q, optimize=True, progressive=True)
    return p


scritti = []
for orig, base in TEAM.items():
    im = rgb(Image.open(R / orig))
    lato = min(im.size)
    im = ImageOps.fit(im, (lato, lato), Image.LANCZOS)          # quadrato centrato, come lo mostra la pagina
    for w in (480, 960):
        if w <= lato:
            scritti.append(salva_jpg(im.resize((w, w), Image.LANCZOS), f'{base}-{w}.jpg'))

for orig, base in TESTATE.items():
    im = rgb(Image.open(R / orig))
    for w in (800, 1600):
        w2 = min(w, im.size[0])
        h2 = round(im.size[1] * w2 / im.size[0])
        scritti.append(salva_jpg(im.resize((w2, h2), Image.LANCZOS), f'{base}-{w}.jpg', q=84))

for orig, (base, w) in LOGHI.items():
    im = in_srgb(ImageOps.exif_transpose(Image.open(R / orig)))
    im = im.resize((w, round(im.size[1] * w / im.size[0])), Image.LANCZOS)
    p = OUT / f'{base}-{w}.png'
    im.info.pop('icc_profile', None)
    im.save(p, 'PNG', optimize=True)
    scritti.append(p)

tot = sum(p.stat().st_size for p in scritti)
for p in scritti:
    print(f'{p.stat().st_size // 1024:5d} kB  {p.relative_to(R).as_posix()}')
print(f'{len(scritti)} file, {tot // 1024} kB in tutto')
