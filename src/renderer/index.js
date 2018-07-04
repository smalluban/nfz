import { define } from 'hybrids';
import NfzApp from './nfz-app';

import './style.css';

define('nfz-app', NfzApp);

const container = document.getElementById('app');
container.appendChild(document.createElement('nfz-app'));
