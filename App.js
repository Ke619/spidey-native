import React, { useRef, useEffect } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { GLView } from 'expo-gl';
import { Renderer } from 'expo-three';
import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system/legacy';
import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';

export default function App() {
  const rafRef = useRef(null);
  useEffect(() => () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); }, []);

  const onContextCreate = async (gl) => {
    const w = gl.drawingBufferWidth, h = gl.drawingBufferHeight;
    const renderer = new Renderer({ gl });
    renderer.setSize(w, h);
    renderer.setClearColor(0x223344, 1);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 1000);
    camera.position.set(0, 1.5, 4);
    camera.lookAt(0, 0.8, 0);

    scene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 1.2));
    const dir = new THREE.DirectionalLight(0xffffff, 1.5);
    dir.position.set(3, 5, 4);
    scene.add(dir);

    console.log('loading criminal.fbx...');
    const asset = Asset.fromModule(require('./assets/criminal.fbx'));
    await asset.downloadAsync();
    const uri = asset.localUri || asset.uri;

    const b64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    const bin = require('./b64').decode(b64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);

    const fbx = new FBXLoader().parse(bytes.buffer, '');
    console.log('fbx loaded, children:', fbx.children.length);
    fbx.scale.setScalar(0.02); scene.add(fbx); scene.add(new THREE.Mesh(new THREE.BoxGeometry(1,1,1), new THREE.MeshBasicMaterial({color: 0xff00ff})));

    const render = () => {
      rafRef.current = requestAnimationFrame(render);
      fbx.rotation.y += 0.005;
      renderer.render(scene, camera);
      gl.endFrameEXP();
    };
    render();
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <GLView style={styles.gl} onContextCreate={onContextCreate} />
      <Text style={styles.label}>criminal.fbx test</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0512' },
  gl: { flex: 1 },
  label: { position: 'absolute', bottom: 40, left: 0, right: 0, textAlign: 'center', color: '#fff', fontSize: 12 },
});
