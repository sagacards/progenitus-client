import { easeOutCubic, easeOutQuint } from './ease';

export default function scroll(element: HTMLElement, to : number = 0, duration: number = 1000) { 
    const startingY = element.scrollTop;
    const diff = to - startingY;
    let start : number;
  
    // Bootstrap our animation - it will get called right before next frame shall be rendered.
    window.requestAnimationFrame(function step(timestamp) {
      if (!start) start = timestamp;
      // Elapsed milliseconds since start of scrolling.
      var time = timestamp - start;
      // Get percent of completion in range [0, 1].
      var percent = easeOutQuint(Math.min(time / duration, 1));
  
      element.scrollTo(0, startingY + diff * percent);
  
      // Proceed with animation as long as we wanted it to.
      if (time < duration) {
        window.requestAnimationFrame(step);
      }
    })
  }