import React from 'react';
import {Sequence, Track, useVideoConfig} from 'remotion';
import {Intro, MailScene, ArchiveScene, RiskScene, ContactScene, ChecklistScene} from './outlook-scenes.jsx';

// Times refer to the original MP3. The shared parent trims audio, captions and scenes together.
export function OutlookTimeline(){
 const {fps}=useVideoConfig();
 return <Track name="Simulação do Outlook">
  <Sequence name="A cobrança inesperada" durationInFrames={Math.round(8.54*fps)}><Intro/></Sequence>
  <Sequence name="O anexo chegou" from={Math.round(8.54*fps)} durationInFrames={Math.round(17.84*fps)-Math.round(8.54*fps)}><MailScene/></Sequence>
  <Sequence name="A embalagem da surpresa" from={Math.round(17.84*fps)} durationInFrames={Math.round(27.18*fps)-Math.round(17.84*fps)}><MailScene kind="pressure"/></Sequence>
  <Sequence name="Um arquivo sem origem confirmada" from={Math.round(27.18*fps)} durationInFrames={Math.round(32.94*fps)-Math.round(27.18*fps)}><MailScene kind="risk"/></Sequence>
  <Sequence name="Abrir ZIP e executar conteúdo" from={Math.round(32.94*fps)} durationInFrames={Math.round(42.32*fps)-Math.round(32.94*fps)}><ArchiveScene/></Sequence>
  <Sequence name="Ops, temos um problema" from={Math.round(42.32*fps)} durationInFrames={Math.round(51.36*fps)-Math.round(42.32*fps)}><RiskScene/></Sequence>
  <Sequence name="Os riscos do conteúdo" from={Math.round(51.36*fps)} durationInFrames={Math.round(62.4*fps)-Math.round(51.36*fps)}><RiskScene details/></Sequence>
  <Sequence name="ZIP não é o problema por si só" from={Math.round(62.4*fps)} durationInFrames={Math.round(72.76*fps)-Math.round(62.4*fps)}><MailScene kind="inspect"/></Sequence>
  <Sequence name="Três perguntas antes de abrir" from={Math.round(72.76*fps)} durationInFrames={Math.round(83.42*fps)-Math.round(72.76*fps)}><ChecklistScene/></Sequence>
  <Sequence name="Uma decisão diferente" from={Math.round(83.42*fps)} durationInFrames={Math.round(86.82*fps)-Math.round(83.42*fps)}><MailScene kind="verify"/></Sequence>
  <Sequence name="Confirmar por contato conhecido" from={Math.round(86.82*fps)} durationInFrames={Math.round(101.18*fps)-Math.round(86.82*fps)}><ContactScene/></Sequence>
  <Sequence name="Confirmar antes de clicar" from={Math.round(101.18*fps)} durationInFrames={Math.round(110.92*fps)-Math.round(101.18*fps)}><MailScene kind="verify"/></Sequence>
  <Sequence name="Contas conhecidas também podem ser comprometidas" from={Math.round(110.92*fps)} durationInFrames={Math.round(119.74*fps)-Math.round(110.92*fps)}><MailScene kind="sender"/></Sequence>
  <Sequence name="Não execute, comunique a TI" from={Math.round(119.74*fps)} durationInFrames={Math.round(127.64*fps)-Math.round(119.74*fps)}><MailScene kind="report"/></Sequence>
  <Sequence name="Pare, verifique e prossiga" from={Math.round(127.64*fps)} durationInFrames={4286-Math.round(127.64*fps)}><ChecklistScene ending/></Sequence>
 </Track>;
}
