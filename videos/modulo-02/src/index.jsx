import React from 'react';
import {AbsoluteFill, Composition, registerRoot} from 'remotion';
import {Aula02Outlook} from './aula02-outlook.jsx';

const Preview = () => <AbsoluteFill style={{backgroundColor: '#102331', color: '#c2eb97', justifyContent: 'center', alignItems: 'center', fontFamily: 'Arial', fontSize: 64}}>Academia do Caos · Módulo 02</AbsoluteFill>;
const Root = () => <>
  <Composition id="Aula02Outlook" component={Aula02Outlook} width={1920} height={1080} fps={30} durationInFrames={4226} />
  <Composition id="Modulo02" component={Preview} width={1920} height={1080} fps={30} durationInFrames={1800} />
</>;
registerRoot(Root);
