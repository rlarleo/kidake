import React, { useRef, useState, useCallback, useEffect } from 'react';
import './App.css';
import styled from 'styled-components';
import test1 from './images/dong1.png';
import test2 from './images/dong2.png';
import test3 from './images/dong3.png';
import test4 from './images/dong4.png';
import test5 from './images/dong5.png';

const StyledImg = styled.img`
  opacity: ${({ op }:{op: number}) => op};
`;

interface Coordinate {
  x: number;
  y: number;
}

const images: string[] = [test1, test2, test3, test4, test5];

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [mousePosition, setMousePosition] = useState<Coordinate | undefined>(
    undefined,
  );
  const [isPainting, setIsPainting] = useState(false);
  const [width, setWidth] = useState<number>(window.innerWidth);
  const [height, setHeight] = useState<number>(window.innerHeight);
  const [isChange, setIsChange] = useState<boolean>(false);
  const [chageImage, setChangeImage] = useState<any>();
  const [chageOp, setChangeOp] = useState<any>();
  const [currentIndex, setCurrentIndex] = useState(0);
  const handleResize = () => {
    setWidth(window.innerWidth);
    setHeight(window.innerHeight);
  };

  const isClear = useCallback(() => {
    if (!canvasRef.current) {
      return false;
    }
    const canvas: HTMLCanvasElement = canvasRef.current;
    let context = canvas.getContext('2d');
    if (context) {
      const img = context.getImageData(0, 0, width, height);
      const transparentData = img.data.filter(e => e === 0);
      if(transparentData.length / img.data.length  > 0.5) return true;
    }
    return false;
  }, [height, width]);

  const handleChangeImage = useCallback(() => {
    let inter: any = null;
    let i = 1;
    let img: any;
    setIsChange(true);
    setChangeOp(1);
    if (!canvasRef.current) {
      return;
    }
    const canvas: HTMLCanvasElement = canvasRef.current;
    const context = canvas.getContext('2d');
    if (context) {
      context.globalCompositeOperation = 'source-over';
      img = canvas.toDataURL('image/*');
      setChangeImage(img);

      context.fill();
      context.save();
      context.beginPath();
      context.clearRect(0, 0, width, height);
      context.rect(0, 0, width, height);
      context.fillStyle = 'rgba(255,255,255,0)';
      context.fill();
      context.closePath();
      context.restore();
    }

    inter = setInterval(() => {
      if (context) {
        setChangeOp(i);
        if (i <= 0) {
          setIsChange(false);
          clearInterval(inter);
          inter = null;
          const next = (currentIndex + 1) % images.length;
          setCurrentIndex(next);
        }
      }
      i -= 0.1;
    }, 50);
  }, [currentIndex, height, width]);

  const getCoordinates = (event: MouseEvent): Coordinate | undefined => {
    if (!canvasRef.current) {
      return;
    }

    const canvas: HTMLCanvasElement = canvasRef.current;
    // eslint-disable-next-line consistent-return
    return {
      x: event.pageX - canvas.offsetLeft,
      y: event.pageY - canvas.offsetTop,
    };
  };

  const drawLine = (
    originalMousePosition: Coordinate,
    newMousePosition: Coordinate,
  ) => {
    if (!canvasRef.current) {
      return;
    }
    const canvas: HTMLCanvasElement = canvasRef.current;
    const context = canvas.getContext('2d');

    if (context) {
      context.globalCompositeOperation = 'destination-out';
      context.beginPath();
      context.arc(newMousePosition.x, newMousePosition.y, 150, 0, 2 * Math.PI);
      context.fill();

      context.lineWidth = 300;
      context.beginPath();
      context.moveTo(originalMousePosition.x, originalMousePosition.y);
      context.lineTo(newMousePosition.x, newMousePosition.y);
      context.stroke();

      context.stroke();
    }
  };

  const startPaint = useCallback((event: MouseEvent) => {
    if(!isChange) {
    const coordinates = getCoordinates(event);
    if (coordinates) {
      setIsPainting(true);
      setMousePosition(coordinates);
    }
  }
  }, [isChange]);

  const paint = useCallback(
    (event: MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();
      if(!isChange) {
        if (isPainting) {
          const newMousePosition = getCoordinates(event);
          if (mousePosition && newMousePosition) {
            drawLine(mousePosition, newMousePosition);
            setMousePosition(newMousePosition);
          }
        }
      }
      
    },
    [isChange, isPainting, mousePosition],
  );

  const exitPaint = useCallback(() => {
    if(isClear() && !isChange) handleChangeImage();
    setIsPainting(false);
  }, [handleChangeImage, isChange, isClear]);

  useEffect(() => {
    if (!canvasRef.current) {
      return;
    }
    const canvas: HTMLCanvasElement = canvasRef.current;
    canvas.addEventListener('mousedown', startPaint);
    canvas.addEventListener('mousemove', paint);
    canvas.addEventListener('mouseup', exitPaint);
    canvas.addEventListener('mouseleave', exitPaint);

    // eslint-disable-next-line consistent-return
    return () => {
      canvas.removeEventListener('mousedown', startPaint);
      canvas.removeEventListener('mousemove', paint);
      canvas.removeEventListener('mouseup', exitPaint);
      canvas.removeEventListener('mouseleave', exitPaint);
    };
  }, [startPaint, paint, exitPaint]);

  useEffect(() => {
    if (!canvasRef.current) {
      return;
    }
    const canvas: HTMLCanvasElement = canvasRef.current;
    const context = canvas.getContext('2d');
    const image = new Image();
    image.src = images[currentIndex];

    image.onload = () => {
      if (context) {
        context.globalAlpha = 1;
        context.drawImage(image, 0, 0, width, height);
      }
    };
  }, [height, width, currentIndex]);

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => {
      window.addEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div>
      <div className="box">
        <img className="image-thumbnail" alt="" src={images[(currentIndex + 1) % images.length]} />
        {isChange && <StyledImg className="image-thumbnail" alt="" src={chageImage} op={chageOp} /> }
        <canvas
          style={{ background: 'transparent' }}
          ref={canvasRef}
          width={width}
          height={height}
          className="canvas"
        />
      </div>
    </div>
  );
}

export default App;
