import React, {useEffect, useRef, useState} from 'react';
import {LOCAL_VIDEO} from "../../hooks/useWebRTC";

const Video = ({clientId, provideMediaRef}) => {
    const [src, setSrc] = useState(null);
    const refVideo = useRef();

    useEffect(() => {
         provideMediaRef(clientId, refVideo);
    }, []);

    console.log('SRCSRCSRC', src);
    return (
        <div>
            <video
                ref={refVideo}
                autoPlay
                playsInline
                muted={clientId === LOCAL_VIDEO}
            />
        </div>
    );
};

export default Video;