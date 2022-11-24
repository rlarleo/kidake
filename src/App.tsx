import React, { useRef, useState, useCallback, useEffect } from 'react';
import './App.css';
import test1 from './images/test1.jpeg';
import test2 from './images/test2.jpeg';
import test3 from './images/test3.jpeg';
import test4 from './images/test4.jpeg';

interface Coordinate {
  x: number;
  y: number;
}

const images: string[] = [test1, test2, test3, test4]

const App = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [mousePosition, setMousePosition] = useState<Coordinate | undefined>(
    undefined,
  );
  const [isPainting, setIsPainting] = useState(false);
  const [width, setWidth] = useState<number>(window.innerWidth);
  const [height, setHeight] = useState<number>(window.innerWidth);
  const [currentIndex, setCurrentIndex] = useState(0);
  const handleResize = () => {
    console.log(window.innerWidth);
    setWidth(window.innerWidth);
    setHeight(window.innerHeight);
  }

  const getCoordinates = (event: MouseEvent): Coordinate | undefined => {
    if (!canvasRef.current) {
      return;
    }

    const canvas: HTMLCanvasElement = canvasRef.current;
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
      context.arc(newMousePosition.x, newMousePosition.y, 100, 0, 2 * Math.PI);
      context.fill();

      context.lineWidth = 200;
      context.beginPath();
      context.moveTo(originalMousePosition.x, originalMousePosition.y);
      context.lineTo(newMousePosition.x, newMousePosition.y);
      context.stroke();

      context.stroke();
    }
  };

  const startPaint = useCallback((event: MouseEvent) => {
    const coordinates = getCoordinates(event);
    if (coordinates) {
      setIsPainting(true);
      setMousePosition(coordinates);
    }
  }, []);

  const paint = useCallback(
    (event: MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();

      if (isPainting) {
        const newMousePosition = getCoordinates(event);
        if (mousePosition && newMousePosition) {
          drawLine(mousePosition, newMousePosition);
          setMousePosition(newMousePosition);
        }
      }
    },
    [isPainting, mousePosition],
  );

  const exitPaint = useCallback(() => {
    setIsPainting(false);
  }, []);

  useEffect(() => {
    if (!canvasRef.current) {
      return;
    }
    const canvas: HTMLCanvasElement = canvasRef.current;
    canvas.addEventListener('mousedown', startPaint);
    canvas.addEventListener('mousemove', paint);
    canvas.addEventListener('mouseup', exitPaint);
    canvas.addEventListener('mouseleave', exitPaint);

    return () => {
      canvas.removeEventListener('mousedown', startPaint);
      canvas.removeEventListener('mousemove', paint);
      canvas.removeEventListener('mouseup', exitPaint);
      canvas.removeEventListener('mouseleave', exitPaint);
    };
  }, [startPaint, paint, exitPaint]);

  const handleChangeImage = useCallback(() => {
    let inter: any = null;
    let i = 1

    inter = setInterval(() => {
      if (!canvasRef.current) {
        return;
      }
      const canvas: HTMLCanvasElement = canvasRef.current;
      const context = canvas.getContext('2d');
      if (context) {
        context.globalCompositeOperation = 'source-over';

        context.save();
        context.beginPath()
        context.clearRect(0,0,width,height)
        context.rect(0,0,width,height)
        context.fillStyle = `rgba(255,255,255,${i})`
        context.fill()
        context.closePath()
        context.restore()                 
        
        if(i <= 0) {
            clearInterval(inter)
            inter = null
            const next = (currentIndex + 1) % images.length;
            setCurrentIndex(next);
        }

      }
      i -= 0.1;
    }, 50);
  }, [currentIndex, height, width])

  useEffect(() => {
    if (!canvasRef.current) {
      return;
    }
    console.log(images[currentIndex])
    const canvas: HTMLCanvasElement = canvasRef.current;
    const context = canvas.getContext('2d');

    const image = new Image();
    image.src = images[currentIndex];

    image.onload = function () {
      if (context) {
        context.drawImage(image, 0, 0, width, height);
      }
    };
  }, [height, width, currentIndex]);

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => {
      window.addEventListener('resize', handleResize)
    }
  }, []);

  console.log(currentIndex)

  return (
    <div className="App">
         <button
        onClick={handleChangeImage}
      > 그림 변경 </button>
      <div className='box'
        style={{
          backgroundImage: `url(${`${images[(currentIndex+1) % images.length]}`})`,
        }}>
             
      <div className='test'>
      </div>
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
};

export default App;