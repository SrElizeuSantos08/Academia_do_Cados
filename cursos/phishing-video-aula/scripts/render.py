import argparse,json,re,unicodedata,difflib,subprocess,textwrap
from pathlib import Path
base=Path(__file__).resolve().parent.parent
import imageio_ffmpeg
parser=argparse.ArgumentParser(description='Renderiza a videoaula de phishing com as duas vozes e legendas.')
parser.add_argument('--output-dir',type=Path,default=base/'exports',help='Pasta de destino (padrao: exports).')
parser.add_argument('--overwrite',action='store_true',help='Permite substituir os arquivos na pasta de destino.')
args=parser.parse_args()
out=args.output_dir.resolve()
if not args.overwrite and any((out/name).exists() for name in ['Phishing - video aula.mp4','Phishing - legendas.srt']):
 parser.error('O destino ja contem arquivos. Use outra pasta com --output-dir ou permita a substituicao com --overwrite.')
out.mkdir(parents=True,exist_ok=True)
build=base/'build'
build.mkdir(exist_ok=True)
root=base/'media'
for name in ['Gravando 2026-10-21 105341.mp4','colaborador 1.mp3','narrador aviso.mp3']:
 if not (root/name).is_file():parser.error(f'Arquivo ausente: {root/name}')
ff=imageio_ffmpeg.get_ffmpeg_exe()
texts=(base/'roteiro.txt').read_text(encoding='utf-8').splitlines()
def norm(w):return re.sub(r'[^a-z0-9]','',unicodedata.normalize('NFD',w.lower()).encode('ascii','ignore').decode())
def stamp(t,ass=False):
 h=int(t//3600);m=int(t//60)%60;s=int(t)%60
 return f'{h}:{m:02}:{s:02}.{int(t%1*100):02}' if ass else f'{h:02}:{m:02}:{s:02},{int(t%1*1000):03}'
cues=[]
for k,name in enumerate(['colaborador 1.mp3','narrador aviso.mp3']):
 data=json.loads((base/'transcripts'/(name+'.json')).read_text(encoding='utf-8'));words=[w for s in data for w in s['words']];target=texts[k].split(); mapping={}
 for block in difflib.SequenceMatcher(None,[norm(w['word']) for w in words],[norm(w) for w in target],autojunk=False).get_matching_blocks():
  for j in range(block.size):mapping[block.b+j]=(words[block.a+j]['start'],words[block.a+j]['end'])
 for i in range(len(target)):
  if i not in mapping:
   left=max((j for j in mapping if j<i),default=None);right=min((j for j in mapping if j>i),default=None)
   a=mapping[left][1] if left is not None else 0;b=mapping[right][0] if right is not None else data[-1]['end'];n=(right if right is not None else len(target))-(left if left is not None else -1)-1
   start=a+(b-a)*(i-(left if left is not None else -1)-1)/max(n,1);mapping[i]=(start,start+(b-a)/max(n,1))
 offset=0 if k==0 else 15.05
 start=0
 for i in range(len(target)):
  chunk=' '.join(target[start:i+1])
  if len(chunk)>=65 or (len(chunk)>=30 and re.search(r'[.!?]$',target[i])) or i==len(target)-1:
   cues.append([max(0,mapping[start][0])+offset,max(mapping[i][1],mapping[start][0]+.5)+offset,chunk,k]);start=i+1
ass='''[Script Info]
ScriptType: v4.00+
PlayResX: 1280
PlayResY: 720
WrapStyle: 0
[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,Arial,26,&H00FFFFFF,&H000000FF,&H00101010,&H00101010,0,0,0,0,100,100,0,0,1,1,0,2,65,65,22,1
[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
'''
srt=''
for i,(a,b,t,k) in enumerate(cues):
 if i+1<len(cues):b=min(b,cues[i+1][0]-.03)
 lines='\n'.join(textwrap.wrap(t,76));srt+=f'{i+1}\n{stamp(a)} --> {stamp(b)}\n{lines}\n\n'
 ass+=f'Dialogue: 0,{stamp(a,True)},{stamp(b,True)},Default,,0,0,0,,{lines.replace(chr(10),chr(92)+"N")}\n'
(out/'Phishing - legendas.srt').write_text(srt,encoding='utf-8-sig');(build/'legendas.ass').write_text(ass,encoding='utf-8-sig')
total=15.05+128.3656875+.7
stretch=(total-18.65)/(74.5333-15.05)
filt=f'[0:v]split=2[v0][v1];[v0]trim=0:15.05,setpts=PTS-STARTPTS,tpad=stop_mode=clone:stop_duration=3.6[a];[v1]trim=start=15.05,setpts={stretch}*(PTS-STARTPTS)[b];[a][b]concat=n=2:v=1:a=0,fps=25,scale=1280:600:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:0:color=0x101820,setsar=1,tpad=stop_mode=clone:stop_duration=4,ass=legendas.ass[v];[1:a]aresample=48000,apad,atrim=duration=15.05[c];[2:a]aresample=48000,apad,atrim=duration=129.0656875[n];[c][n]concat=n=2:v=0:a=1,alimiter=limit=0.95[audio]'
cmd=[ff,'-y','-i',str(root/'Gravando 2026-10-21 105341.mp4'),'-i',str(root/'colaborador 1.mp3'),'-i',str(root/'narrador aviso.mp3'),'-filter_complex',filt,'-map','[v]','-map','[audio]','-c:v','libx264','-preset','fast','-crf','20','-pix_fmt','yuv420p','-c:a','aac','-b:a','192k','-t',str(total),'-movflags','+faststart',str(out/'Phishing - video aula.mp4')]
with (build/'render.log').open('w') as log:subprocess.run(cmd,cwd=build,stdout=log,stderr=log,check=True)
print('DONE',out,flush=True)
