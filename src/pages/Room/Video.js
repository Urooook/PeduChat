import React, {useEffect, useRef, useState} from 'react';
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import socket from '../../socket/socket';

import {LOCAL_VIDEO} from "../../hooks/useWebRTC";
import {useParams} from "react-router";

const Video = ({clientId, provideMediaRef}) => {
    const [src, setSrc] = useState(null);
    const refVideo = useRef();
    const canvasRef = useRef();

    useEffect(() => {
         provideMediaRef(clientId, refVideo.current);
    }, [refVideo, clientId]);


    const FigureVariables = {
        PLANE: "PLANE",
        BOX: "BOX",
        SPHERE: "SPHERE",
        TORUS: "TORUS",
        FLAG: "FLAG",
        OWN: "OWN"
    }
    const {id: roomId} = useParams();

    useEffect(() => {
        socket.on('three-transform', (params) => {
            console.log(params);
        })
    }, [])

    const createTreeWorld = (figure) => {
        socket.emit('three', {
            clientId,
            roomId,
            figure
        });
    }

    const createTreeWorld1 = (figure) => {
        const canvas = canvasRef.current

// Scene
        const scene = new THREE.Scene()


        let video = document.querySelector(`video#${LOCAL_VIDEO}`);
        // video.muted = false
        const texture = new THREE.VideoTexture( video );
        console.log(video)




        let geometry;
        let material;

        switch (figure) {
            case FigureVariables.BOX: {
                geometry = new THREE.BoxBufferGeometry(0.8, 1, 1);
                material = new THREE.MeshBasicMaterial( { map: texture} );
                break;
            }
            case FigureVariables.TORUS: {
                geometry = new THREE.TorusBufferGeometry(0.3, 0.2, 64, 128);
                material = new THREE.MeshBasicMaterial( { map: texture} );
                break;
            }
            case FigureVariables.SPHERE: {
                geometry = new THREE.SphereBufferGeometry(0.6,128,128);
                material = new THREE.MeshBasicMaterial( { map: texture} );
                break;
            }

            case FigureVariables.FLAG: {
                geometry = new THREE.PlaneBufferGeometry(1, 1, 32, 32);

                material = new THREE.RawShaderMaterial({
                    vertexShader: `
                    uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
uniform mat4 modelMatrix;
uniform vec2 uWavesCount;
uniform float uTime;

attribute vec3 position;
attribute float aRandom;
attribute vec2 uv;

varying vec2 vUv;
varying float vElevation;

void main() {

    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    float elevation = sin(modelPosition.x * uWavesCount.x - uTime) * 0.1;
    elevation += sin(modelPosition.y * uWavesCount.y - uTime) * 0.1;

    modelPosition.z = elevation;

    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectionPosition = projectionMatrix * viewPosition;

    gl_Position = projectionPosition;

    vUv = uv;
    vElevation = elevation;
}`,
                    fragmentShader: `
                    precision mediump float;

uniform vec3 uColor;
uniform sampler2D uTexture;

varying vec2 vUv;
varying float vElevation;

void main() {
    vec4 textureColor = texture2D(uTexture, vUv);
    gl_FragColor = textureColor;
}`,
                    side: THREE.DoubleSide,
                    transparent: true,
                    uniforms: {
                        uWavesCount: { value: new THREE.Vector2(10, 5) },
                        uTime: { value: 0 },
                        uColor: { value: new THREE.Color('orange') },
                        uTexture: { value: texture },
                    }
                })

                break;
            }

            case FigureVariables.PLANE: {
                geometry = new THREE.PlaneBufferGeometry( 2, 1, 64 );
                material = new THREE.MeshBasicMaterial( {
                    map: texture,

                });
                // material.transparent = true;
                // material.side = THREE.DoubleSide;
                break;
            }

            default: {
                geometry = new THREE.PlaneBufferGeometry( 2,1, 64 );
                material = new THREE.MeshBasicMaterial( {
                    map: texture,
                    transparent: true,
                    side: THREE.DoubleSide
                });
                break
            }
        }

        if(geometry && material) {
            const mesh = new THREE.Mesh(geometry, material);
            scene.add(mesh);
        }





        const sizes = {
            width: 800,
            height: 600
        }

        const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
        camera.position.set(0.25, - 0.25, 1)
        scene.add(camera)

        // Controls
        const controls = new OrbitControls(camera, canvas)
        controls.enableDamping = true

        const renderer = new THREE.WebGLRenderer({
            canvas: canvas
        })
        renderer.setSize(sizes.width, sizes.height)
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        // console.log(scene.children.length)

        /**
         * Animate
         */
        const clock = new THREE.Clock()

        const tick = () =>
        {
            const elapsedTime = clock.getElapsedTime()
            //updateMaterial
            if(material.uniforms) {
                material.uniforms.uTime.value = elapsedTime
            }

            // Update controls
            controls.update()

            // Render
            renderer.render(scene, camera)

            // Call tick again on the next frame
            window.requestAnimationFrame(tick)
        }

        tick()
    }


    return (
           <div>
               <canvas ref={canvasRef} className="webgl"></canvas>
               <video
                   width='100%'
                   height='100%'
                   ref={refVideo}
                   autoPlay
                   playsInline
                   muted={clientId === LOCAL_VIDEO}
                   id={clientId}
               />
               {clientId === LOCAL_VIDEO && (
                   <div>
                       <button onClick={() => createTreeWorld(FigureVariables.PLANE)}>Plane</button>
                       <button onClick={() => createTreeWorld(FigureVariables.BOX)}>Box</button>
                       <button onClick={() => createTreeWorld(FigureVariables.SPHERE)}>Sphere</button>
                       <button onClick={() => createTreeWorld(FigureVariables.TORUS)}>Torus</button>
                       <button onClick={() => createTreeWorld(FigureVariables.FLAG)}>FLAG</button>
                   </div>
               )}
           </div>
    );
};

export default Video;