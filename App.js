import React, { useRef, useEffect, useState } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { GLView } from 'expo-gl';
import { Renderer } from 'expo-three';
import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system/legacy';
import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { decode } from './b64';

export default function App() {
  const [status, setStatus] = useState('start');
  const rafRef = useRef(null);
  useEffect(() => () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); }, []);

  const onContextCreate = async (gl) => {
    try {
      setStatus('renderer');
      const renderer = new Renderer({ gl });
      renderer.setSize(gl.drawingBufferWidth, gl.drawingBufferHeight);
      renderer.setClearColor(0x223344, 1);
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(60, gl.drawingBufferWidth / gl.drawingBufferHeight, 0.1, 1000);
      camera.position.set(0, 1.5, 4);
      camera.lookAt(0, 0.8, 0);
      scene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 1.2));
      const cube = new THREE.Mesh(new THREE.BoxGeometry(1,1,1), new THREE.MeshBasicMaterial({color: 0xff00ff}));
      scene.add(cube);
      setStatus('asset');
      const a = Asset.fromModule(require('./assets/criminal.fbx'));
      await a.downloadAsync();
      setStatus('reading');
      const b64 = await FileSystem.readAsStringAsync(a.localUri || a.uri, { encoding: FileSystem.EncodingType.Base64 });
      setStatus('decoding ' + b64.length);
      const bin = decode(b64);
      const bytes = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      setStatus('parsing ' + bytes.length);
      const fbx = new FBXLoader().parse(bytes.buffer, '');
      fbx.scale.setScalar(0.02);
      scene.add(fbx);
      setStatus('OK ' + fbx.children.length);
      const render = () => {
        rafRef.current = requestAnimationFrame(render);
        cube.rotation.y += 0.01;
        fbx.rotation.y += 0.005;
        renderer.render(scene, camera);
        gl.endFrameEXP();
      };
      render();
    } catch (e) {
      setStatus('ERR ' + (e.message || String(e)).slice(0, 100));
    }
  };
  return (
    <View style={styles.c}>
      <GLView style={styles.g} onContextCreate={onContextCreate} />
      <Text style={styles.l}>{status}</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#000' },
  g: { flex: 1 },
  l: { position: 'absolute', bottom: 20, left: 5, right: 5, color: '#fff', fontSize: 10, fontFamily: 'Courier' },
});
