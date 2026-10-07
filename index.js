import { Blob } from 'expo-blob';
globalThis.Blob = Blob;

import { registerRootComponent } from 'expo';
import App from './App';

registerRootComponent(App);
