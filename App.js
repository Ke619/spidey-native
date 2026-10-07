import React, { useRef, useEffect } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { GLView } from 'expo-gl';
import { Renderer } from 'expo-three';
import { Asset } from 'expo-asset';
import * as THREE from 'three';

export default function App() {
  const rafRef = useRef(null);

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const onContextCreate = async (gl) => {
    const width = gl.drawingBufferWidth;
    const height = gl.drawingBufferHeight;

    const renderer = new Renderer({ gl });
    renderer.setSize(width, height);
    renderer.setClearColor(0x0a0512, 1);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(70, width / height, 0.1, 100);
    camera.position.set(0, 0, 3);

    const asset = Asset.fromModule(require('./assets/icon.png'));
    await asset.downloadAsync();
    const tex = new THREE.TextureLoader().load(asset.localUri || asset.uri);

    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial({ map: tex });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    const render = () => {
      rafRef.current = requestAnimationFrame(render);
      cube.rotation.x += 0.01;
      cube.rotation.y += 0.01;
      renderer.render(scene, camera);
      gl.endFrameEXP();
    };

    render();
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <GLView style={styles.gl} onContextCreate={onContextCreate} />
      <Text style={styles.label}>textured cube - asset test</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0512' },
  gl: { flex: 1 },
  label: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    textAlign: 'center',
    color: '#fff',
    fontSize: 12,
  },
});
