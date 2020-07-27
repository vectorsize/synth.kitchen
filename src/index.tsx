import * as React from 'react';
import * as ReactDOM from 'react-dom';

import './main.css';

import { Kitchen } from './synth-kitchen/kitchen';

const { WebMidi } = require("webmidi");

const appRoot = document.getElementById('root') as HTMLElement;

WebMidi.enable().then(() => {/* alrighty then */ }).catch(() => {/* cry about it */ }).finally(() => {
    ReactDOM.render(
        <Kitchen />,
        appRoot
    );
});


