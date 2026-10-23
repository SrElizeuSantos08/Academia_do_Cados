import React from 'react';
import {Audio} from '@remotion/media';
import {Sequence, staticFile, useVideoConfig} from 'remotion';
import {BasicCaptions} from './basic-captions';
import {OutlookTimeline} from './outlook-timeline.jsx';

export function Aula02Outlook(){
 const {fps,durationInFrames}=useVideoConfig();
 return <Sequence name="Narração e tela sincronizadas" trimBefore={2*fps} durationInFrames={durationInFrames}>
  <OutlookTimeline/>
  <Audio name="Narração fornecida — ElevenLabs" src={staticFile('narracao-original.mp3')}/>
  <BasicCaptions name="Legendas da narração" width={1660} combineTokensWithinMilliseconds={2300} style={{position:'absolute',bottom:60,translate:'130px 0px'}} captions={[
  {
    "text": " Você",
    "startMs": 2060,
    "endMs": 2300,
    "timestampMs": 2180,
    "confidence": null
  },
  {
    "text": " recebe",
    "startMs": 2300,
    "endMs": 2580,
    "timestampMs": 2440,
    "confidence": null
  },
  {
    "text": " um",
    "startMs": 2580,
    "endMs": 2720,
    "timestampMs": 2650,
    "confidence": null
  },
  {
    "text": " e",
    "startMs": 2720,
    "endMs": 2780,
    "timestampMs": 2750,
    "confidence": null
  },
  {
    "text": "-mail",
    "startMs": 2780,
    "endMs": 3140,
    "timestampMs": 2960,
    "confidence": null
  },
  {
    "text": " com",
    "startMs": 3140,
    "endMs": 3320,
    "timestampMs": 3230,
    "confidence": null
  },
  {
    "text": " uma",
    "startMs": 3320,
    "endMs": 3520,
    "timestampMs": 3420,
    "confidence": null
  },
  {
    "text": " cobrança,",
    "startMs": 3520,
    "endMs": 4220,
    "timestampMs": 3870,
    "confidence": null
  },
  {
    "text": " uma",
    "startMs": 4340,
    "endMs": 4560,
    "timestampMs": 4450,
    "confidence": null
  },
  {
    "text": " nota",
    "startMs": 4560,
    "endMs": 4960,
    "timestampMs": 4760,
    "confidence": null
  },
  {
    "text": " fiscal",
    "startMs": 4960,
    "endMs": 5420,
    "timestampMs": 5190,
    "confidence": null
  },
  {
    "text": " ou",
    "startMs": 5420,
    "endMs": 5660,
    "timestampMs": 5540,
    "confidence": null
  },
  {
    "text": " aquele",
    "startMs": 5660,
    "endMs": 6040,
    "timestampMs": 5850,
    "confidence": null
  },
  {
    "text": " documento",
    "startMs": 6040,
    "endMs": 6380,
    "timestampMs": 6210,
    "confidence": null
  },
  {
    "text": " que",
    "startMs": 6380,
    "endMs": 6620,
    "timestampMs": 6500,
    "confidence": null
  },
  {
    "text": " parece",
    "startMs": 6620,
    "endMs": 6760,
    "timestampMs": 6690,
    "confidence": null
  },
  {
    "text": " super",
    "startMs": 7200,
    "endMs": 7660,
    "timestampMs": 7430,
    "confidence": null
  },
  {
    "text": " importante.",
    "startMs": 7660,
    "endMs": 8300,
    "timestampMs": 7980,
    "confidence": null
  },
  {
    "text": " Dentro",
    "startMs": 8540,
    "endMs": 9000,
    "timestampMs": 8770,
    "confidence": null
  },
  {
    "text": " dele",
    "startMs": 9000,
    "endMs": 9380,
    "timestampMs": 9190,
    "confidence": null
  },
  {
    "text": " tem",
    "startMs": 9380,
    "endMs": 9500,
    "timestampMs": 9440,
    "confidence": null
  },
  {
    "text": " um",
    "startMs": 9500,
    "endMs": 9660,
    "timestampMs": 9580,
    "confidence": null
  },
  {
    "text": " arquivo",
    "startMs": 9660,
    "endMs": 10140,
    "timestampMs": 9900,
    "confidence": null
  },
  {
    "text": " ZIP.",
    "startMs": 10140,
    "endMs": 10620,
    "timestampMs": 10380,
    "confidence": null
  },
  {
    "text": " Tudo",
    "startMs": 10820,
    "endMs": 11140,
    "timestampMs": 10980,
    "confidence": null
  },
  {
    "text": " parece",
    "startMs": 11140,
    "endMs": 11520,
    "timestampMs": 11330,
    "confidence": null
  },
  {
    "text": " normal.",
    "startMs": 11520,
    "endMs": 12080,
    "timestampMs": 11800,
    "confidence": null
  },
  {
    "text": " Mas",
    "startMs": 12420,
    "endMs": 12780,
    "timestampMs": 12600,
    "confidence": null
  },
  {
    "text": " será",
    "startMs": 12780,
    "endMs": 13020,
    "timestampMs": 12900,
    "confidence": null
  },
  {
    "text": " que",
    "startMs": 13020,
    "endMs": 13100,
    "timestampMs": 13060,
    "confidence": null
  },
  {
    "text": " é",
    "startMs": 13100,
    "endMs": 13400,
    "timestampMs": 13250,
    "confidence": null
  },
  {
    "text": " mesmo?",
    "startMs": 13400,
    "endMs": 13880,
    "timestampMs": 13640,
    "confidence": null
  },
  {
    "text": " Afinal,",
    "startMs": 14100,
    "endMs": 14680,
    "timestampMs": 14390,
    "confidence": null
  },
  {
    "text": " na",
    "startMs": 14760,
    "endMs": 15240,
    "timestampMs": 15000,
    "confidence": null
  },
  {
    "text": " internet",
    "startMs": 15240,
    "endMs": 15680,
    "timestampMs": 15460,
    "confidence": null
  },
  {
    "text": " nem",
    "startMs": 15680,
    "endMs": 15980,
    "timestampMs": 15830,
    "confidence": null
  },
  {
    "text": " toda",
    "startMs": 15980,
    "endMs": 16300,
    "timestampMs": 16140,
    "confidence": null
  },
  {
    "text": " surpresa",
    "startMs": 16300,
    "endMs": 16700,
    "timestampMs": 16500,
    "confidence": null
  },
  {
    "text": " é",
    "startMs": 16700,
    "endMs": 16940,
    "timestampMs": 16820,
    "confidence": null
  },
  {
    "text": " boa.",
    "startMs": 16940,
    "endMs": 17220,
    "timestampMs": 17080,
    "confidence": null
  },
  {
    "text": " Porque",
    "startMs": 17840,
    "endMs": 18060,
    "timestampMs": 17950,
    "confidence": null
  },
  {
    "text": " tem",
    "startMs": 18060,
    "endMs": 18460,
    "timestampMs": 18260,
    "confidence": null
  },
  {
    "text": " presente",
    "startMs": 18460,
    "endMs": 18720,
    "timestampMs": 18590,
    "confidence": null
  },
  {
    "text": " que",
    "startMs": 18720,
    "endMs": 18880,
    "timestampMs": 18800,
    "confidence": null
  },
  {
    "text": " vem",
    "startMs": 18880,
    "endMs": 19020,
    "timestampMs": 18950,
    "confidence": null
  },
  {
    "text": " com",
    "startMs": 19020,
    "endMs": 19280,
    "timestampMs": 19150,
    "confidence": null
  },
  {
    "text": " laço.",
    "startMs": 19280,
    "endMs": 19620,
    "timestampMs": 19450,
    "confidence": null
  },
  {
    "text": " E",
    "startMs": 19860,
    "endMs": 20060,
    "timestampMs": 19960,
    "confidence": null
  },
  {
    "text": " tem",
    "startMs": 20060,
    "endMs": 20500,
    "timestampMs": 20280,
    "confidence": null
  },
  {
    "text": " presente",
    "startMs": 20500,
    "endMs": 20760,
    "timestampMs": 20630,
    "confidence": null
  },
  {
    "text": " que",
    "startMs": 20760,
    "endMs": 20880,
    "timestampMs": 20820,
    "confidence": null
  },
  {
    "text": " vem",
    "startMs": 20880,
    "endMs": 21300,
    "timestampMs": 21090,
    "confidence": null
  },
  {
    "text": " compactado,",
    "startMs": 21300,
    "endMs": 21960,
    "timestampMs": 21630,
    "confidence": null
  },
  {
    "text": " pronto",
    "startMs": 22220,
    "endMs": 22520,
    "timestampMs": 22370,
    "confidence": null
  },
  {
    "text": " para",
    "startMs": 22520,
    "endMs": 22880,
    "timestampMs": 22700,
    "confidence": null
  },
  {
    "text": " transformar",
    "startMs": 22880,
    "endMs": 23280,
    "timestampMs": 23080,
    "confidence": null
  },
  {
    "text": " seu",
    "startMs": 23280,
    "endMs": 23600,
    "timestampMs": 23440,
    "confidence": null
  },
  {
    "text": " dia",
    "startMs": 23600,
    "endMs": 23760,
    "timestampMs": 23680,
    "confidence": null
  },
  {
    "text": " em",
    "startMs": 23760,
    "endMs": 23860,
    "timestampMs": 23810,
    "confidence": null
  },
  {
    "text": " um",
    "startMs": 23860,
    "endMs": 24080,
    "timestampMs": 23970,
    "confidence": null
  },
  {
    "text": " chamado",
    "startMs": 24080,
    "endMs": 24580,
    "timestampMs": 24330,
    "confidence": null
  },
  {
    "text": " urgente",
    "startMs": 24580,
    "endMs": 24840,
    "timestampMs": 24710,
    "confidence": null
  },
  {
    "text": " para",
    "startMs": 25060,
    "endMs": 25180,
    "timestampMs": 25120,
    "confidence": null
  },
  {
    "text": " a",
    "startMs": 25180,
    "endMs": 25320,
    "timestampMs": 25250,
    "confidence": null
  },
  {
    "text": " equipe",
    "startMs": 25320,
    "endMs": 25600,
    "timestampMs": 25460,
    "confidence": null
  },
  {
    "text": " de",
    "startMs": 25600,
    "endMs": 25800,
    "timestampMs": 25700,
    "confidence": null
  },
  {
    "text": " TI.",
    "startMs": 25800,
    "endMs": 26660,
    "timestampMs": 26230,
    "confidence": null
  },
  {
    "text": " Na",
    "startMs": 27180,
    "endMs": 27360,
    "timestampMs": 27270,
    "confidence": null
  },
  {
    "text": " nossa",
    "startMs": 27360,
    "endMs": 27600,
    "timestampMs": 27480,
    "confidence": null
  },
  {
    "text": " simulação,",
    "startMs": 27600,
    "endMs": 28320,
    "timestampMs": 27960,
    "confidence": null
  },
  {
    "text": " a",
    "startMs": 28400,
    "endMs": 28780,
    "timestampMs": 28590,
    "confidence": null
  },
  {
    "text": " personagem",
    "startMs": 28780,
    "endMs": 29240,
    "timestampMs": 29010,
    "confidence": null
  },
  {
    "text": " recebe",
    "startMs": 29240,
    "endMs": 29520,
    "timestampMs": 29380,
    "confidence": null
  },
  {
    "text": " um",
    "startMs": 29520,
    "endMs": 29700,
    "timestampMs": 29610,
    "confidence": null
  },
  {
    "text": " arquivo",
    "startMs": 29700,
    "endMs": 30300,
    "timestampMs": 30000,
    "confidence": null
  },
  {
    "text": " compactado",
    "startMs": 30300,
    "endMs": 30860,
    "timestampMs": 30580,
    "confidence": null
  },
  {
    "text": " com",
    "startMs": 30860,
    "endMs": 31060,
    "timestampMs": 30960,
    "confidence": null
  },
  {
    "text": " uma",
    "startMs": 31060,
    "endMs": 31360,
    "timestampMs": 31210,
    "confidence": null
  },
  {
    "text": " suposta",
    "startMs": 31360,
    "endMs": 31900,
    "timestampMs": 31630,
    "confidence": null
  },
  {
    "text": " cobrança.",
    "startMs": 31900,
    "endMs": 32720,
    "timestampMs": 32310,
    "confidence": null
  },
  {
    "text": " Curiosa,",
    "startMs": 32940,
    "endMs": 33600,
    "timestampMs": 33270,
    "confidence": null
  },
  {
    "text": " ela",
    "startMs": 33740,
    "endMs": 34080,
    "timestampMs": 33910,
    "confidence": null
  },
  {
    "text": " abre",
    "startMs": 34080,
    "endMs": 34220,
    "timestampMs": 34150,
    "confidence": null
  },
  {
    "text": " o",
    "startMs": 34220,
    "endMs": 34420,
    "timestampMs": 34320,
    "confidence": null
  },
  {
    "text": " ZIP",
    "startMs": 34420,
    "endMs": 34780,
    "timestampMs": 34600,
    "confidence": null
  },
  {
    "text": " e",
    "startMs": 34780,
    "endMs": 35080,
    "timestampMs": 34930,
    "confidence": null
  },
  {
    "text": " decide",
    "startMs": 35080,
    "endMs": 35400,
    "timestampMs": 35240,
    "confidence": null
  },
  {
    "text": " executar",
    "startMs": 35400,
    "endMs": 35820,
    "timestampMs": 35610,
    "confidence": null
  },
  {
    "text": " o",
    "startMs": 35820,
    "endMs": 36000,
    "timestampMs": 35910,
    "confidence": null
  },
  {
    "text": " arquivo",
    "startMs": 36000,
    "endMs": 36580,
    "timestampMs": 36290,
    "confidence": null
  },
  {
    "text": " sem",
    "startMs": 36580,
    "endMs": 36780,
    "timestampMs": 36680,
    "confidence": null
  },
  {
    "text": " verificar",
    "startMs": 36780,
    "endMs": 37340,
    "timestampMs": 37060,
    "confidence": null
  },
  {
    "text": " sua",
    "startMs": 37340,
    "endMs": 37600,
    "timestampMs": 37470,
    "confidence": null
  },
  {
    "text": " origem.",
    "startMs": 37600,
    "endMs": 38020,
    "timestampMs": 37810,
    "confidence": null
  },
  {
    "text": " Ah,",
    "startMs": 38340,
    "endMs": 38620,
    "timestampMs": 38480,
    "confidence": null
  },
  {
    "text": " deve",
    "startMs": 38800,
    "endMs": 39020,
    "timestampMs": 38910,
    "confidence": null
  },
  {
    "text": " ser",
    "startMs": 39020,
    "endMs": 39180,
    "timestampMs": 39100,
    "confidence": null
  },
  {
    "text": " só",
    "startMs": 39180,
    "endMs": 39240,
    "timestampMs": 39210,
    "confidence": null
  },
  {
    "text": " um",
    "startMs": 39240,
    "endMs": 39500,
    "timestampMs": 39370,
    "confidence": null
  },
  {
    "text": " documento.",
    "startMs": 39500,
    "endMs": 40080,
    "timestampMs": 39790,
    "confidence": null
  },
  {
    "text": " Vou",
    "startMs": 40220,
    "endMs": 40440,
    "timestampMs": 40330,
    "confidence": null
  },
  {
    "text": " abrir",
    "startMs": 40440,
    "endMs": 40820,
    "timestampMs": 40630,
    "confidence": null
  },
  {
    "text": " rapidinho.",
    "startMs": 40820,
    "endMs": 41440,
    "timestampMs": 41130,
    "confidence": null
  },
  {
    "text": " Ops,",
    "startMs": 42320,
    "endMs": 42920,
    "timestampMs": 42620,
    "confidence": null
  },
  {
    "text": " temos",
    "startMs": 43200,
    "endMs": 43440,
    "timestampMs": 43320,
    "confidence": null
  },
  {
    "text": " um",
    "startMs": 43440,
    "endMs": 43840,
    "timestampMs": 43640,
    "confidence": null
  },
  {
    "text": " problema.",
    "startMs": 43840,
    "endMs": 44460,
    "timestampMs": 44150,
    "confidence": null
  },
  {
    "text": " A",
    "startMs": 44700,
    "endMs": 44900,
    "timestampMs": 44800,
    "confidence": null
  },
  {
    "text": " famosa",
    "startMs": 44900,
    "endMs": 45620,
    "timestampMs": 45260,
    "confidence": null
  },
  {
    "text": " frase,",
    "startMs": 45620,
    "endMs": 45900,
    "timestampMs": 45760,
    "confidence": null
  },
  {
    "text": " comigo",
    "startMs": 46220,
    "endMs": 46500,
    "timestampMs": 46360,
    "confidence": null
  },
  {
    "text": " não",
    "startMs": 46500,
    "endMs": 47040,
    "timestampMs": 46770,
    "confidence": null
  },
  {
    "text": " acontece,",
    "startMs": 47040,
    "endMs": 47420,
    "timestampMs": 47230,
    "confidence": null
  },
  {
    "text": " acaba",
    "startMs": 47860,
    "endMs": 48100,
    "timestampMs": 47980,
    "confidence": null
  },
  {
    "text": " de",
    "startMs": 48100,
    "endMs": 48420,
    "timestampMs": 48260,
    "confidence": null
  },
  {
    "text": " deixar",
    "startMs": 48420,
    "endMs": 48540,
    "timestampMs": 48480,
    "confidence": null
  },
  {
    "text": " a",
    "startMs": 48540,
    "endMs": 48720,
    "timestampMs": 48630,
    "confidence": null
  },
  {
    "text": " equipe",
    "startMs": 48720,
    "endMs": 49020,
    "timestampMs": 48870,
    "confidence": null
  },
  {
    "text": " de",
    "startMs": 49020,
    "endMs": 49260,
    "timestampMs": 49140,
    "confidence": null
  },
  {
    "text": " TI",
    "startMs": 49260,
    "endMs": 49420,
    "timestampMs": 49340,
    "confidence": null
  },
  {
    "text": " de",
    "startMs": 49420,
    "endMs": 49660,
    "timestampMs": 49540,
    "confidence": null
  },
  {
    "text": " cabelo",
    "startMs": 49660,
    "endMs": 49960,
    "timestampMs": 49810,
    "confidence": null
  },
  {
    "text": " em",
    "startMs": 49960,
    "endMs": 50220,
    "timestampMs": 50090,
    "confidence": null
  },
  {
    "text": " pé.",
    "startMs": 50220,
    "endMs": 50860,
    "timestampMs": 50540,
    "confidence": null
  },
  {
    "text": " Brincadeiras",
    "startMs": 51360,
    "endMs": 51940,
    "timestampMs": 51650,
    "confidence": null
  },
  {
    "text": " à",
    "startMs": 51940,
    "endMs": 52240,
    "timestampMs": 52090,
    "confidence": null
  },
  {
    "text": " parte,",
    "startMs": 52240,
    "endMs": 52680,
    "timestampMs": 52460,
    "confidence": null
  },
  {
    "text": " um",
    "startMs": 52760,
    "endMs": 52960,
    "timestampMs": 52860,
    "confidence": null
  },
  {
    "text": " arquivo",
    "startMs": 52960,
    "endMs": 53440,
    "timestampMs": 53200,
    "confidence": null
  },
  {
    "text": " dentro",
    "startMs": 53440,
    "endMs": 53780,
    "timestampMs": 53610,
    "confidence": null
  },
  {
    "text": " de",
    "startMs": 53780,
    "endMs": 53880,
    "timestampMs": 53830,
    "confidence": null
  },
  {
    "text": " um",
    "startMs": 53880,
    "endMs": 54100,
    "timestampMs": 53990,
    "confidence": null
  },
  {
    "text": " ZIP",
    "startMs": 54100,
    "endMs": 54480,
    "timestampMs": 54290,
    "confidence": null
  },
  {
    "text": " pode",
    "startMs": 54480,
    "endMs": 54720,
    "timestampMs": 54600,
    "confidence": null
  },
  {
    "text": " conter",
    "startMs": 54720,
    "endMs": 55280,
    "timestampMs": 55000,
    "confidence": null
  },
  {
    "text": " programas",
    "startMs": 55280,
    "endMs": 55660,
    "timestampMs": 55470,
    "confidence": null
  },
  {
    "text": " maliciosos",
    "startMs": 55660,
    "endMs": 56560,
    "timestampMs": 56110,
    "confidence": null
  },
  {
    "text": " capazes",
    "startMs": 56560,
    "endMs": 56820,
    "timestampMs": 56690,
    "confidence": null
  },
  {
    "text": " de",
    "startMs": 56940,
    "endMs": 57160,
    "timestampMs": 57050,
    "confidence": null
  },
  {
    "text": " roubar",
    "startMs": 57160,
    "endMs": 58140,
    "timestampMs": 57650,
    "confidence": null
  },
  {
    "text": " informações,",
    "startMs": 58140,
    "endMs": 58500,
    "timestampMs": 58320,
    "confidence": null
  },
  {
    "text": " comprometer",
    "startMs": 58660,
    "endMs": 59180,
    "timestampMs": 58920,
    "confidence": null
  },
  {
    "text": " o",
    "startMs": 59180,
    "endMs": 59380,
    "timestampMs": 59280,
    "confidence": null
  },
  {
    "text": " computador",
    "startMs": 59380,
    "endMs": 60120,
    "timestampMs": 59750,
    "confidence": null
  },
  {
    "text": " ou",
    "startMs": 60120,
    "endMs": 60580,
    "timestampMs": 60350,
    "confidence": null
  },
  {
    "text": " permitir",
    "startMs": 60580,
    "endMs": 60920,
    "timestampMs": 60750,
    "confidence": null
  },
  {
    "text": " acessos",
    "startMs": 60920,
    "endMs": 61420,
    "timestampMs": 61170,
    "confidence": null
  },
  {
    "text": " indevidos.",
    "startMs": 61420,
    "endMs": 62160,
    "timestampMs": 61790,
    "confidence": null
  },
  {
    "text": " E",
    "startMs": 62400,
    "endMs": 62680,
    "timestampMs": 62540,
    "confidence": null
  },
  {
    "text": " atenção,",
    "startMs": 62680,
    "endMs": 63240,
    "timestampMs": 62960,
    "confidence": null
  },
  {
    "text": " o",
    "startMs": 63360,
    "endMs": 63700,
    "timestampMs": 63530,
    "confidence": null
  },
  {
    "text": " ZIP",
    "startMs": 63700,
    "endMs": 64000,
    "timestampMs": 63850,
    "confidence": null
  },
  {
    "text": " por",
    "startMs": 64000,
    "endMs": 64220,
    "timestampMs": 64110,
    "confidence": null
  },
  {
    "text": " si",
    "startMs": 64220,
    "endMs": 64560,
    "timestampMs": 64390,
    "confidence": null
  },
  {
    "text": " só",
    "startMs": 64580,
    "endMs": 64940,
    "timestampMs": 64760,
    "confidence": null
  },
  {
    "text": " não",
    "startMs": 64940,
    "endMs": 65180,
    "timestampMs": 65060,
    "confidence": null
  },
  {
    "text": " é",
    "startMs": 65180,
    "endMs": 65360,
    "timestampMs": 65270,
    "confidence": null
  },
  {
    "text": " perigoso.",
    "startMs": 65360,
    "endMs": 66100,
    "timestampMs": 65730,
    "confidence": null
  },
  {
    "text": " O",
    "startMs": 66260,
    "endMs": 66500,
    "timestampMs": 66380,
    "confidence": null
  },
  {
    "text": " risco",
    "startMs": 66500,
    "endMs": 66860,
    "timestampMs": 66680,
    "confidence": null
  },
  {
    "text": " está",
    "startMs": 66860,
    "endMs": 67020,
    "timestampMs": 66940,
    "confidence": null
  },
  {
    "text": " no",
    "startMs": 67020,
    "endMs": 67580,
    "timestampMs": 67300,
    "confidence": null
  },
  {
    "text": " conteúdo",
    "startMs": 67580,
    "endMs": 68060,
    "timestampMs": 67820,
    "confidence": null
  },
  {
    "text": " e",
    "startMs": 68060,
    "endMs": 68680,
    "timestampMs": 68370,
    "confidence": null
  },
  {
    "text": " principalmente",
    "startMs": 68680,
    "endMs": 69340,
    "timestampMs": 69010,
    "confidence": null
  },
  {
    "text": " em",
    "startMs": 69340,
    "endMs": 69620,
    "timestampMs": 69480,
    "confidence": null
  },
  {
    "text": " executar",
    "startMs": 69620,
    "endMs": 70220,
    "timestampMs": 69920,
    "confidence": null
  },
  {
    "text": " arquivos",
    "startMs": 70220,
    "endMs": 70780,
    "timestampMs": 70500,
    "confidence": null
  },
  {
    "text": " sem",
    "startMs": 70780,
    "endMs": 70980,
    "timestampMs": 70880,
    "confidence": null
  },
  {
    "text": " verificar",
    "startMs": 70980,
    "endMs": 71520,
    "timestampMs": 71250,
    "confidence": null
  },
  {
    "text": " sua",
    "startMs": 71520,
    "endMs": 71800,
    "timestampMs": 71660,
    "confidence": null
  },
  {
    "text": " procedência.",
    "startMs": 71800,
    "endMs": 72540,
    "timestampMs": 72170,
    "confidence": null
  },
  {
    "text": " Por",
    "startMs": 72760,
    "endMs": 73040,
    "timestampMs": 72900,
    "confidence": null
  },
  {
    "text": " isso,",
    "startMs": 73040,
    "endMs": 73300,
    "timestampMs": 73170,
    "confidence": null
  },
  {
    "text": " antes",
    "startMs": 73620,
    "endMs": 73800,
    "timestampMs": 73710,
    "confidence": null
  },
  {
    "text": " de",
    "startMs": 73800,
    "endMs": 74080,
    "timestampMs": 73940,
    "confidence": null
  },
  {
    "text": " abrir",
    "startMs": 74080,
    "endMs": 74300,
    "timestampMs": 74190,
    "confidence": null
  },
  {
    "text": " ou",
    "startMs": 74300,
    "endMs": 74580,
    "timestampMs": 74440,
    "confidence": null
  },
  {
    "text": " executar",
    "startMs": 74580,
    "endMs": 75080,
    "timestampMs": 74830,
    "confidence": null
  },
  {
    "text": " qualquer",
    "startMs": 75080,
    "endMs": 75760,
    "timestampMs": 75420,
    "confidence": null
  },
  {
    "text": " coisa,",
    "startMs": 75760,
    "endMs": 76020,
    "timestampMs": 75890,
    "confidence": null
  },
  {
    "text": " pergunte",
    "startMs": 76200,
    "endMs": 76560,
    "timestampMs": 76380,
    "confidence": null
  },
  {
    "text": " a",
    "startMs": 76560,
    "endMs": 76640,
    "timestampMs": 76600,
    "confidence": null
  },
  {
    "text": " si",
    "startMs": 76640,
    "endMs": 76980,
    "timestampMs": 76810,
    "confidence": null
  },
  {
    "text": " mesmo.",
    "startMs": 76980,
    "endMs": 77380,
    "timestampMs": 77180,
    "confidence": null
  },
  {
    "text": " Eu",
    "startMs": 77520,
    "endMs": 77760,
    "timestampMs": 77640,
    "confidence": null
  },
  {
    "text": " estava",
    "startMs": 77760,
    "endMs": 78180,
    "timestampMs": 77970,
    "confidence": null
  },
  {
    "text": " esperando",
    "startMs": 78180,
    "endMs": 78420,
    "timestampMs": 78300,
    "confidence": null
  },
  {
    "text": " esse",
    "startMs": 78420,
    "endMs": 78620,
    "timestampMs": 78520,
    "confidence": null
  },
  {
    "text": " arquivo?",
    "startMs": 78620,
    "endMs": 79240,
    "timestampMs": 78930,
    "confidence": null
  },
  {
    "text": " Conheço",
    "startMs": 79420,
    "endMs": 79900,
    "timestampMs": 79660,
    "confidence": null
  },
  {
    "text": " sua",
    "startMs": 79900,
    "endMs": 80140,
    "timestampMs": 80020,
    "confidence": null
  },
  {
    "text": " origem?",
    "startMs": 80140,
    "endMs": 80660,
    "timestampMs": 80400,
    "confidence": null
  },
  {
    "text": " Posso",
    "startMs": 80840,
    "endMs": 81300,
    "timestampMs": 81070,
    "confidence": null
  },
  {
    "text": " confirmar",
    "startMs": 81300,
    "endMs": 81780,
    "timestampMs": 81540,
    "confidence": null
  },
  {
    "text": " se",
    "startMs": 81780,
    "endMs": 81920,
    "timestampMs": 81850,
    "confidence": null
  },
  {
    "text": " ele",
    "startMs": 81920,
    "endMs": 82020,
    "timestampMs": 81970,
    "confidence": null
  },
  {
    "text": " é",
    "startMs": 82020,
    "endMs": 82200,
    "timestampMs": 82110,
    "confidence": null
  },
  {
    "text": " legítimo?",
    "startMs": 82200,
    "endMs": 82940,
    "timestampMs": 82570,
    "confidence": null
  },
  {
    "text": " Agora,",
    "startMs": 83420,
    "endMs": 83680,
    "timestampMs": 83550,
    "confidence": null
  },
  {
    "text": " nossa",
    "startMs": 84000,
    "endMs": 84620,
    "timestampMs": 84310,
    "confidence": null
  },
  {
    "text": " personagem",
    "startMs": 84620,
    "endMs": 84980,
    "timestampMs": 84800,
    "confidence": null
  },
  {
    "text": " decide",
    "startMs": 84980,
    "endMs": 85260,
    "timestampMs": 85120,
    "confidence": null
  },
  {
    "text": " agir",
    "startMs": 85280,
    "endMs": 85700,
    "timestampMs": 85490,
    "confidence": null
  },
  {
    "text": " corretamente.",
    "startMs": 85700,
    "endMs": 86400,
    "timestampMs": 86050,
    "confidence": null
  },
  {
    "text": " Em",
    "startMs": 86820,
    "endMs": 86980,
    "timestampMs": 86900,
    "confidence": null
  },
  {
    "text": " vez",
    "startMs": 86980,
    "endMs": 87120,
    "timestampMs": 87050,
    "confidence": null
  },
  {
    "text": " de",
    "startMs": 87120,
    "endMs": 87360,
    "timestampMs": 87240,
    "confidence": null
  },
  {
    "text": " confiar",
    "startMs": 87360,
    "endMs": 87860,
    "timestampMs": 87610,
    "confidence": null
  },
  {
    "text": " cegamente",
    "startMs": 87860,
    "endMs": 88440,
    "timestampMs": 88150,
    "confidence": null
  },
  {
    "text": " na",
    "startMs": 88440,
    "endMs": 88680,
    "timestampMs": 88560,
    "confidence": null
  },
  {
    "text": " mensagem,",
    "startMs": 88680,
    "endMs": 89240,
    "timestampMs": 88960,
    "confidence": null
  },
  {
    "text": " ela",
    "startMs": 89400,
    "endMs": 89600,
    "timestampMs": 89500,
    "confidence": null
  },
  {
    "text": " verifica",
    "startMs": 89600,
    "endMs": 90060,
    "timestampMs": 89830,
    "confidence": null
  },
  {
    "text": " a",
    "startMs": 90060,
    "endMs": 90180,
    "timestampMs": 90120,
    "confidence": null
  },
  {
    "text": " cobrança",
    "startMs": 90180,
    "endMs": 90720,
    "timestampMs": 90450,
    "confidence": null
  },
  {
    "text": " por",
    "startMs": 90720,
    "endMs": 90900,
    "timestampMs": 90810,
    "confidence": null
  },
  {
    "text": " meio",
    "startMs": 90900,
    "endMs": 91060,
    "timestampMs": 90980,
    "confidence": null
  },
  {
    "text": " de",
    "startMs": 91060,
    "endMs": 91140,
    "timestampMs": 91100,
    "confidence": null
  },
  {
    "text": " um",
    "startMs": 91140,
    "endMs": 91380,
    "timestampMs": 91260,
    "confidence": null
  },
  {
    "text": " contato",
    "startMs": 91380,
    "endMs": 91760,
    "timestampMs": 91570,
    "confidence": null
  },
  {
    "text": " que",
    "startMs": 91760,
    "endMs": 92000,
    "timestampMs": 91880,
    "confidence": null
  },
  {
    "text": " já",
    "startMs": 92000,
    "endMs": 92240,
    "timestampMs": 92120,
    "confidence": null
  },
  {
    "text": " conhece,",
    "startMs": 92300,
    "endMs": 92840,
    "timestampMs": 92570,
    "confidence": null
  },
  {
    "text": " utilizando",
    "startMs": 93080,
    "endMs": 93520,
    "timestampMs": 93300,
    "confidence": null
  },
  {
    "text": " um",
    "startMs": 93520,
    "endMs": 93760,
    "timestampMs": 93640,
    "confidence": null
  },
  {
    "text": " canal",
    "startMs": 93760,
    "endMs": 94140,
    "timestampMs": 93950,
    "confidence": null
  },
  {
    "text": " confiável",
    "startMs": 94140,
    "endMs": 94920,
    "timestampMs": 94530,
    "confidence": null
  },
  {
    "text": " salvo",
    "startMs": 94920,
    "endMs": 95260,
    "timestampMs": 95090,
    "confidence": null
  },
  {
    "text": " anteriormente.",
    "startMs": 95260,
    "endMs": 96080,
    "timestampMs": 95670,
    "confidence": null
  },
  {
    "text": " Nada",
    "startMs": 96400,
    "endMs": 96620,
    "timestampMs": 96510,
    "confidence": null
  },
  {
    "text": " de",
    "startMs": 96620,
    "endMs": 96880,
    "timestampMs": 96750,
    "confidence": null
  },
  {
    "text": " confiar",
    "startMs": 96880,
    "endMs": 97400,
    "timestampMs": 97140,
    "confidence": null
  },
  {
    "text": " apenas",
    "startMs": 97400,
    "endMs": 97640,
    "timestampMs": 97520,
    "confidence": null
  },
  {
    "text": " no",
    "startMs": 97640,
    "endMs": 97960,
    "timestampMs": 97800,
    "confidence": null
  },
  {
    "text": " telefone",
    "startMs": 97960,
    "endMs": 98340,
    "timestampMs": 98150,
    "confidence": null
  },
  {
    "text": " ou",
    "startMs": 98500,
    "endMs": 98640,
    "timestampMs": 98570,
    "confidence": null
  },
  {
    "text": " no",
    "startMs": 98640,
    "endMs": 98920,
    "timestampMs": 98780,
    "confidence": null
  },
  {
    "text": " link",
    "startMs": 98920,
    "endMs": 99140,
    "timestampMs": 99030,
    "confidence": null
  },
  {
    "text": " que",
    "startMs": 99140,
    "endMs": 99340,
    "timestampMs": 99240,
    "confidence": null
  },
  {
    "text": " veio",
    "startMs": 99340,
    "endMs": 99480,
    "timestampMs": 99410,
    "confidence": null
  },
  {
    "text": " no",
    "startMs": 99480,
    "endMs": 99620,
    "timestampMs": 99550,
    "confidence": null
  },
  {
    "text": " e",
    "startMs": 99620,
    "endMs": 99620,
    "timestampMs": 99620,
    "confidence": null
  },
  {
    "text": "-mail",
    "startMs": 99620,
    "endMs": 99980,
    "timestampMs": 99800,
    "confidence": null
  },
  {
    "text": " suspeito.",
    "startMs": 99980,
    "endMs": 100660,
    "timestampMs": 100320,
    "confidence": null
  },
  {
    "text": " Porque",
    "startMs": 101180,
    "endMs": 101560,
    "timestampMs": 101370,
    "confidence": null
  },
  {
    "text": " confirmar",
    "startMs": 101560,
    "endMs": 101980,
    "timestampMs": 101770,
    "confidence": null
  },
  {
    "text": " a",
    "startMs": 101980,
    "endMs": 102160,
    "timestampMs": 102070,
    "confidence": null
  },
  {
    "text": " cobrança",
    "startMs": 102160,
    "endMs": 102840,
    "timestampMs": 102500,
    "confidence": null
  },
  {
    "text": " antes",
    "startMs": 102840,
    "endMs": 103020,
    "timestampMs": 102930,
    "confidence": null
  },
  {
    "text": " de",
    "startMs": 103020,
    "endMs": 103200,
    "timestampMs": 103110,
    "confidence": null
  },
  {
    "text": " clicar",
    "startMs": 103200,
    "endMs": 103780,
    "timestampMs": 103490,
    "confidence": null
  },
  {
    "text": " é",
    "startMs": 103780,
    "endMs": 104180,
    "timestampMs": 103980,
    "confidence": null
  },
  {
    "text": " inteligência.",
    "startMs": 104180,
    "endMs": 104880,
    "timestampMs": 104530,
    "confidence": null
  },
  {
    "text": " Clicar",
    "startMs": 105080,
    "endMs": 105700,
    "timestampMs": 105390,
    "confidence": null
  },
  {
    "text": " primeiro",
    "startMs": 105700,
    "endMs": 105920,
    "timestampMs": 105810,
    "confidence": null
  },
  {
    "text": " e",
    "startMs": 105920,
    "endMs": 106180,
    "timestampMs": 106050,
    "confidence": null
  },
  {
    "text": " perguntar",
    "startMs": 106180,
    "endMs": 106800,
    "timestampMs": 106490,
    "confidence": null
  },
  {
    "text": " depois",
    "startMs": 106800,
    "endMs": 107320,
    "timestampMs": 107060,
    "confidence": null
  },
  {
    "text": " é",
    "startMs": 107320,
    "endMs": 107480,
    "timestampMs": 107400,
    "confidence": null
  },
  {
    "text": " dar",
    "startMs": 107480,
    "endMs": 107920,
    "timestampMs": 107700,
    "confidence": null
  },
  {
    "text": " trabalho",
    "startMs": 107920,
    "endMs": 108340,
    "timestampMs": 108130,
    "confidence": null
  },
  {
    "text": " extra",
    "startMs": 108340,
    "endMs": 108580,
    "timestampMs": 108460,
    "confidence": null
  },
  {
    "text": " para",
    "startMs": 108580,
    "endMs": 108680,
    "timestampMs": 108630,
    "confidence": null
  },
  {
    "text": " o",
    "startMs": 108680,
    "endMs": 108960,
    "timestampMs": 108820,
    "confidence": null
  },
  {
    "text": " pessoal",
    "startMs": 108960,
    "endMs": 109140,
    "timestampMs": 109050,
    "confidence": null
  },
  {
    "text": " do",
    "startMs": 109140,
    "endMs": 109320,
    "timestampMs": 109230,
    "confidence": null
  },
  {
    "text": " suporte.",
    "startMs": 109320,
    "endMs": 109760,
    "timestampMs": 109540,
    "confidence": null
  },
  {
    "text": " Lembre",
    "startMs": 110920,
    "endMs": 111300,
    "timestampMs": 111110,
    "confidence": null
  },
  {
    "text": "-se,",
    "startMs": 111300,
    "endMs": 111580,
    "timestampMs": 111440,
    "confidence": null
  },
  {
    "text": " até",
    "startMs": 111900,
    "endMs": 112120,
    "timestampMs": 112010,
    "confidence": null
  },
  {
    "text": " uma",
    "startMs": 112120,
    "endMs": 112440,
    "timestampMs": 112280,
    "confidence": null
  },
  {
    "text": " conta",
    "startMs": 112440,
    "endMs": 112760,
    "timestampMs": 112600,
    "confidence": null
  },
  {
    "text": " conhecida",
    "startMs": 112760,
    "endMs": 113560,
    "timestampMs": 113160,
    "confidence": null
  },
  {
    "text": " pode",
    "startMs": 113560,
    "endMs": 113860,
    "timestampMs": 113710,
    "confidence": null
  },
  {
    "text": " ser",
    "startMs": 113860,
    "endMs": 114120,
    "timestampMs": 113990,
    "confidence": null
  },
  {
    "text": " comprometida.",
    "startMs": 114120,
    "endMs": 114940,
    "timestampMs": 114530,
    "confidence": null
  },
  {
    "text": " Por",
    "startMs": 115160,
    "endMs": 115460,
    "timestampMs": 115310,
    "confidence": null
  },
  {
    "text": " isso,",
    "startMs": 115460,
    "endMs": 115680,
    "timestampMs": 115570,
    "confidence": null
  },
  {
    "text": " confirme",
    "startMs": 116120,
    "endMs": 116360,
    "timestampMs": 116240,
    "confidence": null
  },
  {
    "text": " a",
    "startMs": 116360,
    "endMs": 116480,
    "timestampMs": 116420,
    "confidence": null
  },
  {
    "text": " cobrança",
    "startMs": 116480,
    "endMs": 116960,
    "timestampMs": 116720,
    "confidence": null
  },
  {
    "text": " por",
    "startMs": 116960,
    "endMs": 117080,
    "timestampMs": 117020,
    "confidence": null
  },
  {
    "text": " um",
    "startMs": 117080,
    "endMs": 117300,
    "timestampMs": 117190,
    "confidence": null
  },
  {
    "text": " canal",
    "startMs": 117300,
    "endMs": 117760,
    "timestampMs": 117530,
    "confidence": null
  },
  {
    "text": " independente",
    "startMs": 117760,
    "endMs": 118440,
    "timestampMs": 118100,
    "confidence": null
  },
  {
    "text": " e",
    "startMs": 118440,
    "endMs": 118820,
    "timestampMs": 118630,
    "confidence": null
  },
  {
    "text": " confiável.",
    "startMs": 118820,
    "endMs": 119520,
    "timestampMs": 119170,
    "confidence": null
  },
  {
    "text": " Se",
    "startMs": 119740,
    "endMs": 119920,
    "timestampMs": 119830,
    "confidence": null
  },
  {
    "text": " suspeitar",
    "startMs": 119920,
    "endMs": 120460,
    "timestampMs": 120190,
    "confidence": null
  },
  {
    "text": " de",
    "startMs": 120460,
    "endMs": 120540,
    "timestampMs": 120500,
    "confidence": null
  },
  {
    "text": " um",
    "startMs": 120540,
    "endMs": 120700,
    "timestampMs": 120620,
    "confidence": null
  },
  {
    "text": " arquivo",
    "startMs": 120700,
    "endMs": 121060,
    "timestampMs": 120880,
    "confidence": null
  },
  {
    "text": " malicioso,",
    "startMs": 121060,
    "endMs": 121760,
    "timestampMs": 121410,
    "confidence": null
  },
  {
    "text": " não",
    "startMs": 122140,
    "endMs": 122320,
    "timestampMs": 122230,
    "confidence": null
  },
  {
    "text": " o",
    "startMs": 122320,
    "endMs": 122640,
    "timestampMs": 122480,
    "confidence": null
  },
  {
    "text": " execute.",
    "startMs": 122640,
    "endMs": 123080,
    "timestampMs": 122860,
    "confidence": null
  },
  {
    "text": " Siga",
    "startMs": 123340,
    "endMs": 123620,
    "timestampMs": 123480,
    "confidence": null
  },
  {
    "text": " os",
    "startMs": 123620,
    "endMs": 123900,
    "timestampMs": 123760,
    "confidence": null
  },
  {
    "text": " procedimentos",
    "startMs": 123900,
    "endMs": 124460,
    "timestampMs": 124180,
    "confidence": null
  },
  {
    "text": " da",
    "startMs": 124460,
    "endMs": 124680,
    "timestampMs": 124570,
    "confidence": null
  },
  {
    "text": " sua",
    "startMs": 124680,
    "endMs": 124960,
    "timestampMs": 124820,
    "confidence": null
  },
  {
    "text": " organização",
    "startMs": 124960,
    "endMs": 125660,
    "timestampMs": 125310,
    "confidence": null
  },
  {
    "text": " e",
    "startMs": 125660,
    "endMs": 125920,
    "timestampMs": 125790,
    "confidence": null
  },
  {
    "text": " comunique",
    "startMs": 125920,
    "endMs": 126340,
    "timestampMs": 126130,
    "confidence": null
  },
  {
    "text": " a",
    "startMs": 126340,
    "endMs": 126500,
    "timestampMs": 126420,
    "confidence": null
  },
  {
    "text": " equipe",
    "startMs": 126500,
    "endMs": 126820,
    "timestampMs": 126660,
    "confidence": null
  },
  {
    "text": " de",
    "startMs": 126820,
    "endMs": 127040,
    "timestampMs": 126930,
    "confidence": null
  },
  {
    "text": " TI.",
    "startMs": 127040,
    "endMs": 127420,
    "timestampMs": 127230,
    "confidence": null
  },
  {
    "text": " E",
    "startMs": 127640,
    "endMs": 127860,
    "timestampMs": 127750,
    "confidence": null
  },
  {
    "text": " fica",
    "startMs": 127860,
    "endMs": 128020,
    "timestampMs": 127940,
    "confidence": null
  },
  {
    "text": " a",
    "startMs": 128020,
    "endMs": 128080,
    "timestampMs": 128050,
    "confidence": null
  },
  {
    "text": " lição.",
    "startMs": 128080,
    "endMs": 128640,
    "timestampMs": 128360,
    "confidence": null
  },
  {
    "text": " Pare,",
    "startMs": 128920,
    "endMs": 129300,
    "timestampMs": 129110,
    "confidence": null
  },
  {
    "text": " verifique",
    "startMs": 129560,
    "endMs": 130380,
    "timestampMs": 129970,
    "confidence": null
  },
  {
    "text": " e",
    "startMs": 130380,
    "endMs": 130720,
    "timestampMs": 130550,
    "confidence": null
  },
  {
    "text": " só",
    "startMs": 130720,
    "endMs": 131060,
    "timestampMs": 130890,
    "confidence": null
  },
  {
    "text": " então",
    "startMs": 131060,
    "endMs": 131320,
    "timestampMs": 131190,
    "confidence": null
  },
  {
    "text": " prosiga.",
    "startMs": 131320,
    "endMs": 131940,
    "timestampMs": 131630,
    "confidence": null
  },
  {
    "text": " Afinal,",
    "startMs": 132220,
    "endMs": 132820,
    "timestampMs": 132520,
    "confidence": null
  },
  {
    "text": " alguns",
    "startMs": 133180,
    "endMs": 133640,
    "timestampMs": 133410,
    "confidence": null
  },
  {
    "text": " segundos",
    "startMs": 133640,
    "endMs": 133820,
    "timestampMs": 133730,
    "confidence": null
  },
  {
    "text": " de",
    "startMs": 133820,
    "endMs": 134300,
    "timestampMs": 134060,
    "confidence": null
  },
  {
    "text": " cuidado",
    "startMs": 134300,
    "endMs": 134640,
    "timestampMs": 134470,
    "confidence": null
  },
  {
    "text": " podem",
    "startMs": 134640,
    "endMs": 134920,
    "timestampMs": 134780,
    "confidence": null
  },
  {
    "text": " economizar",
    "startMs": 134920,
    "endMs": 135700,
    "timestampMs": 135310,
    "confidence": null
  },
  {
    "text": " horas",
    "startMs": 135700,
    "endMs": 135920,
    "timestampMs": 135810,
    "confidence": null
  },
  {
    "text": " de",
    "startMs": 135920,
    "endMs": 136100,
    "timestampMs": 136010,
    "confidence": null
  },
  {
    "text": " dor",
    "startMs": 136100,
    "endMs": 136220,
    "timestampMs": 136160,
    "confidence": null
  },
  {
    "text": " de",
    "startMs": 136220,
    "endMs": 136700,
    "timestampMs": 136460,
    "confidence": null
  },
  {
    "text": " cabeça",
    "startMs": 136700,
    "endMs": 137160,
    "timestampMs": 136930,
    "confidence": null
  },
  {
    "text": " e",
    "startMs": 137160,
    "endMs": 137580,
    "timestampMs": 137370,
    "confidence": null
  },
  {
    "text": " vários",
    "startMs": 137580,
    "endMs": 137840,
    "timestampMs": 137710,
    "confidence": null
  },
  {
    "text": " chamados",
    "startMs": 137840,
    "endMs": 138320,
    "timestampMs": 138080,
    "confidence": null
  },
  {
    "text": " para",
    "startMs": 138320,
    "endMs": 138420,
    "timestampMs": 138370,
    "confidence": null
  },
  {
    "text": " o",
    "startMs": 138420,
    "endMs": 138540,
    "timestampMs": 138480,
    "confidence": null
  },
  {
    "text": " suporte.",
    "startMs": 138540,
    "endMs": 139040,
    "timestampMs": 138790,
    "confidence": null
  },
  {
    "text": " [risos]",
    "startMs": 139480,
    "endMs": 141020,
    "timestampMs": 140250,
    "confidence": null
  },
  {
    "text": " Até",
    "startMs": 141420,
    "endMs": 141580,
    "timestampMs": 141500,
    "confidence": null
  },
  {
    "text": " o",
    "startMs": 141580,
    "endMs": 141860,
    "timestampMs": 141720,
    "confidence": null
  },
  {
    "text": " próximo",
    "startMs": 141860,
    "endMs": 142160,
    "timestampMs": 142010,
    "confidence": null
  },
  {
    "text": " módulo!",
    "startMs": 142160,
    "endMs": 142540,
    "timestampMs": 142350,
    "confidence": null
  }
]}/>
 </Sequence>;
}
