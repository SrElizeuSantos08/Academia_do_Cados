import {readFileSync,writeFileSync} from 'node:fs';

const captions=JSON.parse(readFileSync('out/captions-original.json','utf8')).filter(c=>c.startMs>=2000).map(c=>({...c,text:c.text.replace(/\bzip\b/gi,'ZIP').replace('Hahahaha!','[risos]')}));
if(!captions.length || captions[0].startMs!==2060)throw Error('Revisar o ponto de corte da narração.');
writeFileSync('public/captions-original.json',JSON.stringify(captions,null,2));
const source=`import React from 'react';
import {Audio} from '@remotion/media';
import {Sequence, staticFile, useVideoConfig} from 'remotion';
import {BasicCaptions} from './basic-captions';
import {OutlookTimeline} from './outlook-timeline.jsx';

export function Aula02Outlook(){
 const {fps,durationInFrames}=useVideoConfig();
 return <Sequence name="Narração e tela sincronizadas" trimBefore={2*fps} durationInFrames={durationInFrames}>
  <OutlookTimeline/>
  <Audio name="Narração fornecida — ElevenLabs" src={staticFile('narracao-original.mp3')}/>
  <BasicCaptions name="Legendas da narração" width={1660} combineTokensWithinMilliseconds={2300} style={{position:'absolute',bottom:60,translate:'130px 0px'}} captions={${JSON.stringify(captions,null,2)}}/>
 </Sequence>;
}
`;
writeFileSync('src/aula02-outlook.jsx',source);
const stamp=ms=>{const v=Math.max(0,Math.round(ms));return String(Math.floor(v/3600000)).padStart(2,'0')+':'+String(Math.floor(v/60000)%60).padStart(2,'0')+':'+String(Math.floor(v/1000)%60).padStart(2,'0')+'.'+String(v%1000).padStart(3,'0')};
let groups=[],group=[];
for(const c of captions){group.push(c);if(c.endMs-group[0].startMs>2300 || /[.!?]$/.test(c.text.trim())){groups.push(group);group=[]}}
if(group.length)groups.push(group);
writeFileSync('public/aula-02.vtt','WEBVTT\n\n'+groups.map(g=>stamp(g[0].startMs-2000)+' --> '+stamp(g.at(-1).endMs-2000)+'\n'+g.map(c=>c.text).join('').trim()).join('\n\n')+'\n');
console.log('Legendas:',captions.length,'palavras; corte inicial: 2 segundos.');
