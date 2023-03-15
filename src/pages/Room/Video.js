import React, {useEffect, useRef, useState} from 'react';
import {LOCAL_VIDEO} from "../../hooks/useWebRTC";

const Video = ({clientId, provideMediaRef}) => {
    const [src, setSrc] = useState(null);
    const refVideo = useRef();

    useEffect(() => {
         provideMediaRef(clientId, refVideo.current);
    }, [refVideo, clientId]);

    console.log('SRCSRCSRC', clientId, refVideo);
    return (
            <video
                ref={refVideo}
                autoPlay
                playsInline
                muted={clientId === LOCAL_VIDEO}
            />
    );
};

export default Video;