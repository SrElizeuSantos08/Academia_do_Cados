import {readFileSync, writeFileSync} from 'node:fs';
import {env} from '@huggingface/transformers';
import {canUseWhisperWebGpu, downloadWhisperModel, loadWhisperModel, transcribe, toCaptions} from '@remotion/whisper-webgpu';

env.cacheDir = new URL('./out/models/', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const buffer=readFileSync(new URL('./out/narracao.wav',import.meta.url));
let pos=12,pcm;
while(pos+8<buffer.length){const name=buffer.toString('ascii',pos,pos+4),size=buffer.readUInt32LE(pos+4);if(name==='data'){pcm=buffer.subarray(pos+8,pos+8+size);break}pos+=8+size+(size%2)}
if(!pcm)throw Error('WAV sem dados de áudio');
const waveform=new Float32Array(pcm.length/2);
for(let i=0;i<waveform.length;i++)waveform[i]=pcm.readInt16LE(i*2)/32768;
console.log('Áudio:',waveform.length/16000,'segundos. GPU:',await canUseWhisperWebGpu());
const model='small';
let checkpoint=-1;
await downloadWhisperModel({model,onProgress:p=>{const next=Math.floor(p.progress/20);if(next>checkpoint){checkpoint=next;console.log('Modelo:',Math.round(p.progress)+'%')}}});
console.log('Carregando modelo...');
const handle=await loadWhisperModel({model});
console.log('Transcrevendo em português...');
try{
 const result=await transcribe({model,channelWaveform:waveform,language:'pt',task:'transcribe'});
 writeFileSync(new URL('./out/transcript.json',import.meta.url),JSON.stringify(result,null,2));
 writeFileSync(new URL('./out/captions-original.json',import.meta.url),JSON.stringify(toCaptions({whisperWebGpuOutput:result}).captions,null,2));
 console.log(result.text);
}finally{await handle[Symbol.asyncDispose]()}
