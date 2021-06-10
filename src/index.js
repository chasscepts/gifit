import eventEmitter from './lib/event-emitter';
import mixin from './lib/mixin';
import './assets/css/style.scss';

const thumbnailDimensions = { width: 320, height: 200 };
const emitter = eventEmitter();
const events = {
  CLEAR_FRAMES: 'clear frames',
  ADD_FRAME: 'add frame',
  FRAME_SELECTED: 'frame selected',
};

const algorithms = {
  HISTOGRAM: 'Histogram',
  MEDIAN_CUT: 'Median Cut',
  MODIFIED_HISTOGRAM: 'Modified Histogram',
  K_CUT: 'K Means',
};

const DCT = {
  algorithm: algorithms.MEDIAN_CUT, ctLength: 256, order: 8, dither: true,
};

const gct = (() => {
  let ct = DCT;
  ct = mixin({}, ct);

  const orderSelect = document.querySelector('#gct-order-select');
  const lengthSelect = document.querySelector('#gct-length-select');
  const ditherCheck = document.querySelector('#gct-dither-check');
  // const histogramRadio = document.querySelector('#local-histogram');
  // const medianCutRadio = document.querySelector('#local-median-cut');
  // const modifiedHistogramRadio = document.querySelector('#local-modified-histogram');
  // const kCutRadio = document.querySelector('#local-k-cut');
  // const algoRadios = [histogramRadio, medianCutRadio, modifiedHistogramRadio, kCutRadio];

  const setOrder = (order) => {
    ct.order = order;

    let max = 256;
    if (ct.algorithm === algorithms.HISTOGRAM) {
      max = order * order * order;
    } else if (ct.algorithm === algorithms.MEDIAN_CUT) {
      max = 2 ** order;
    }
    if (max > 256) {
      max = 256;
    }

    let options = '<option>2</option>';
    let i = 2;
    let val = 2;
    while (i <= 8) {
      const temp = 2 ** i;
      if (temp > max) {
        break;
      }
      val = temp;
      options += `<option>${temp}</option>`;
      i += 1;
    }
    lengthSelect.innerHTML = options;

    if (ct.ctLength > val) {
      ct.ctLength = val;
    }
    lengthSelect.value = ct.ctLength;
  };

  document.querySelectorAll('.gct-algo-radio').forEach((radio) => {
    radio.addEventListener('input', (evt) => {
      if (evt.target.checked) {
        ct.algorithm = evt.target.value;
        setOrder(ct.order);
      }
    });
  });

  ditherCheck.addEventListener('change', () => {
    ct.dither = ditherCheck.checked;
  });

  lengthSelect.addEventListener('change', () => {
    ct.ctLength = lengthSelect.value;
  });

  orderSelect.addEventListener('change', () => setOrder(parseInt(orderSelect.value, 10)));

  return ct;
})();

const feedBack = (() => {
  const screen = document.createElement('div');
  screen.classList.add('screen-cover');
  const dim = document.createElement('div');
  dim.classList.add('dim');
  screen.append(dim);
  const bodyWrap = document.createElement('div');
  bodyWrap.classList.add('cover', 'center-child');
  screen.append(bodyWrap);
  const body = document.createElement('div');
  body.classList.add('feedback-body');
  bodyWrap.append(body);
  const heading = document.createElement('h2');
  heading.classList.add('heading');
  body.append(heading);
  const hr = document.createElement('hr');
  hr.classList.add('dotted');
  body.append(hr);
  const p = document.createElement('p');
  p.classList.add('feedback');
  body.append(p);

  body.addEventListener('click', (evt) => evt.stopPropagation());
  bodyWrap.addEventListener('click', () => screen.remove());

  const info = (text) => {
    heading.textContent = 'Info';
    p.textContent = text;
    body.classList.remove('error');
    document.body.append(screen);
  };
  const error = (text) => {
    heading.textContent = 'Error!';
    p.textContent = text;
    body.classList.add('error');
    document.body.append(screen);
  };

  return { info, error };
})();

// const sample = (() => {
//   const img = new Image();
//   img.height = 100;
//   img.width = 100;
//   img.src = sampleSrc;
//   return img;
// })();

// const randByte = () => Math.floor(Math.random() * 255);

// const randImage = () => {
//   const canvas = document.createElement('canvas');
//   canvas.width = thumbnailDimensions.width;
//   canvas.height = thumbnailDimensions.height;
//   const ctx = canvas.getContext('2d');
//   const xDivs = Math.floor(canvas.width / 2);
//   const yDivs = Math.floor(canvas.height / 2);

//   let y = 0;
//   while (y < canvas.height) {
//     let x = 0;
//     const yStart = y;
//     y += yDivs;
//     if (y > canvas.height) {
//       y = canvas.height;
//     }
//     while (x < canvas.width) {
//       const xStart = x;
//       x += xDivs;
//       ctx.fillStyle = `rgb(${randByte()}, ${randByte()}, ${randByte()})`;
//       for (let j = yStart; j < y; j += 1) {
//         if (x > canvas.width) {
//           x = canvas.width;
//         }
//         for (let i = xStart; i < x; i += 1) {
//           ctx.fillRect(i, j, 1, 1);
//         }
//       }
//     }
//   }

//   return canvas.toDataURL('image/png');
// };

const busy = (() => {
  const cover = document.querySelector('#busy-screen');

  return {
    set: (busy = true) => {
      if (busy) {
        cover.classList.add('open');
      } else {
        cover.classList.remove('open');
      }
    },
  };
})();

// Setup Sidebar Open/Close
(() => {
  const hamburger = document.querySelector('#hamburger');
  const sidebar = document.querySelector('#sidebar');
  let open = true;

  hamburger.addEventListener('click', () => {
    if (open) {
      hamburger.classList.remove('open');
      sidebar.classList.remove('open');
    } else {
      hamburger.classList.add('open');
      sidebar.classList.add('open');
    }
    open = !open;
  });
})();

// Setup Sidebar TabControl
(() => {
  const tabHeaders = document.querySelectorAll('.tab-header');
  let activeTabHeader;
  let activeTabItem;

  tabHeaders.forEach((header) => {
    header.addEventListener('click', () => {
      if (activeTabHeader === header) {
        return;
      }

      if (activeTabHeader) {
        activeTabHeader.classList.remove('active');
      }
      if (activeTabItem) {
        activeTabItem.classList.remove('active');
      }

      activeTabHeader = header;
      activeTabItem = document.querySelector(header.getAttribute('data-tab'));
      activeTabItem.classList.add('active');
      header.classList.add('active');
    });

    if (header.classList.contains('active')) {
      header.click();
    }
  });
})();

// Thumbnail Height
(() => {
  const video = document.querySelector('#player');
  const startText = document.querySelector('#frame-start-text');
  const durationText = document.querySelector('#duration-text');
  const rateText = document.querySelector('#video-framerate-value');
  const MAX_DURATION = 5;
  let loaded = false;
  let start = 0;
  let duration = 1;
  let fps = 12;

  video.onerror = () => {
    loaded = false;
  };

  document.querySelector('#load-video-btn').addEventListener('change', (evt) => {
    const file = evt.target.files && evt.target.files[0];
    if (file) {
      video.src = URL.createObjectURL(file);
      loaded = true;
    }
  });

  document.querySelector('#frame-start-btn').addEventListener('click', () => {
    if (!loaded) {
      return;
    }
    start = video.currentTime;
    startText.textContent = start.toFixed(2);
  });

  document.querySelector('#duration-slider').addEventListener('input', (evt) => {
    duration = parseFloat(((evt.target.value * MAX_DURATION) / evt.target.max).toFixed(1));
    durationText.textContent = duration;
  });

  document.querySelector('#video-framerate-slider').addEventListener('input', (evt) => {
    fps = Math.round(evt.target.value);
    rateText.textContent = fps;
  });

  document.querySelector('#clear-frames-btn').addEventListener('click', () => {
    emitter.emit(events.CLEAR_FRAMES);
  });

  const grab = (time, endTime, step, callback) => setTimeout(() => {
    if (time > endTime) {
      callback();
      busy.set(false);
      return;
    }
    video.currentTime = time;
    emitter.emit(events.ADD_FRAME, video);
    grab(time + step, endTime, step, callback);
  }, 200);

  document.querySelector('#grab-btn').addEventListener('click', () => {
    if (!loaded) {
      feedBack.error('Please load a video file');
      return;
    }
    if (duration <= 0) {
      feedBack.error('The duration must be greater than 0');
      return;
    }
    busy.set(true);
    emitter.emit(events.CLEAR_FRAMES);
    const tempTime = video.currentTime;
    video.currentTime = start;
    grab(start, start + duration, 1 / fps, () => {
      video.currentTime = tempTime;
    });
  });
})();

const thumbnail = (() => {
  let draggedImage;
  let dropped = false;
  let hasImages = false;
  let selectedImage = null;

  let frames = [];

  let nextInsertId = 1;

  const eventPosition = (elemt, evt) => {
    const rect = elemt.getBoundingClientRect();
    return {
      x: evt.clientX - rect.left,
      y: evt.clientY - rect.top,
    };
  };
  const container = (() => {
    const con = document.querySelector('#thumbnails-container');
    con.style.maxHeight = `${con.clientHeight}px`;
    return con;
  })();

  const middleOf = (elemt) => {
    const rect1 = container.getBoundingClientRect();
    const rect2 = elemt.getBoundingClientRect();

    return {
      x: rect2.x - rect1.x + (elemt.width / 2),
      y: rect2.y - rect1.y + (elemt.height / 2),
    };
  };

  container.addEventListener('dragover', (evt) => {
    evt.preventDefault();
    evt.dataTransfer.dropEffect = 'move';
  });

  container.addEventListener('drop', (evt) => {
    evt.preventDefault();
    if (!draggedImage) {
      return;
    }
    const { x: x1, y: y1 } = eventPosition(container, evt);
    const { x: x2, y: y2 } = JSON.parse(evt.dataTransfer.getData('application/json'));
    let x = x1 - x2;
    let y = y1 - y2;
    let appended = false;
    if (x < 0) {
      x = 0;
      if (y < 0) {
        y = 0;
        draggedImage.remove();
        container.prepend(draggedImage);
        appended = true;
      }
    }
    if (!appended) {
      if (y < 0) {
        y = 0;
      }
      const children = container.childNodes;
      let child;
      for (let i = 0, n = children.length; i < n; i += 1) {
        const temp = children[i];
        const mid = middleOf(temp);
        if (mid.x > x && mid.y > y) {
          child = temp;
          break;
        }
      }
      draggedImage.remove();
      if (child) {
        container.insertBefore(draggedImage, child);
      } else {
        container.append(draggedImage);
      }
      appended = true;
    }
    draggedImage.style.display = 'block';
    draggedImage = null;
    dropped = true;
  });

  const createCanvas = (video) => {
    const canvas = document.createElement('canvas');
    canvas.width = thumbnailDimensions.width;
    canvas.height = thumbnailDimensions.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const element = new Image();
    element.width = canvas.width;
    element.height = canvas.height;
    element.classList.add('thumbnail');
    element.src = canvas.toDataURL('image/png');
    element.setAttribute('data-index', nextInsertId);

    container.append(element);

    const frame = {
      image: element,
      lct: null,
      id: nextInsertId,
      remove: () => {
        element.remove();
        frames = frames.filter((f) => frame.id !== f.id);
      },
    };

    nextInsertId += 1;

    frames.push(frame);

    element.ondragstart = (evt) => {
      const data = eventPosition(element, evt);
      evt.dataTransfer.setData('application/json', JSON.stringify(data));
      evt.dataTransfer.dropEffect = 'move';
      draggedImage = element;
      dropped = false;
      setTimeout(() => { element.style.display = 'none'; }, 0);
    };

    element.ondragend = () => {
      if (!dropped) {
        draggedImage = null;
        element.style.display = 'block';
      }
    };

    element.addEventListener('mousedown', () => {
      if (element === selectedImage) {
        return;
      }
      if (selectedImage) {
        selectedImage.classList.remove('selected');
      }
      selectedImage = element;
      selectedImage.classList.add('selected');
      emitter.emit(events.FRAME_SELECTED, frame);
    });

    return frame;
  };

  const findFrame = (id) => {
    for (let i = 0, n = frames.length; i < n; i += 1) {
      if (frames[i].id === id) {
        return frames[i];
      }
    }
    return null;
  };

  emitter.subscribe(events.CLEAR_FRAMES, () => {
    container.innerHTML = '';
    hasImages = false;
  });

  emitter.subscribe(events.ADD_FRAME, (video) => {
    createCanvas(video);
    hasImages = true;
  });

  return {
    images: () => {
      const imgs = [];
      container.childNodes.forEach((child) => imgs.push(child));
      return imgs;
    },
    frames: () => {
      const frames = [];
      container.childNodes.forEach((child) => {
        const id = parseInt(child.getAttribute('data-id'), 10);
        const frame = findFrame(id);
        if (frame) {
          frames.push(frame);
        }
      });
      return frames;
    },
    hasImages,
  };
})();

// Simulation
(() => {
  const canvas = document.querySelector('#simulation-canvas');
  const ctx = canvas.getContext('2d');
  const simulateBtn = document.querySelector('#simulation-btn');
  const delayText = document.querySelector('#simulation-interval-value');

  let reverse = true;
  let stopped = true;
  let delay = 100;

  document.querySelector('#simulation-reverse-check').addEventListener('input', (evt) => {
    reverse = evt.target.checked;
  });

  document.querySelector('#simulation-interval-slider').addEventListener('input', (evt) => {
    delay = 10 * parseInt(evt.target.value, 10);
    delayText.textContent = delay;
  });

  const loop = (() => {
    let images = [];
    let length = 0;
    let idx = 0;
    let step = 1;

    const loop = () => {
      ctx.drawImage(images[idx], 0, 0, canvas.width, canvas.height);
      if (stopped) {
        return;
      }

      idx += step;
      if (idx === 0 && step === -1) {
        step = 1;
      } else if (idx >= length) {
        if (reverse) {
          step = -1;
          idx = length - 1;
        } else {
          idx = 0;
        }
      }

      setTimeout(loop, delay);
    };

    const start = () => {
      images = thumbnail.images();
      length = images.length;
      if (length <= 0) {
        feedBack.error('You have not added any frames to the collection.');
        return;
      }
      loop();
    };

    return { start };
  })();

  simulateBtn.addEventListener('click', () => {
    if (!thumbnail.hasImages) {
      feedBack.error('No frames found');
      return;
    }
    if (stopped) {
      stopped = false;
      simulateBtn.textContent = 'Stop';
      loop.start();
    } else {
      stopped = true;
      simulateBtn.textContent = 'Simulate';
    }
  });
})();

// LCT
(() => {
  let frame = { image: null, lct: gct };
  frame.lct = mixin({}, gct);

  const canvas = document.querySelector('#frame-view-canvas');
  const ctx = canvas.getContext('2d');
  const useGCTCheck = document.querySelector('#use-gct-check');
  const orderSelect = document.querySelector('#lct-order-select');
  const lengthSelect = document.querySelector('#lct-length-select');
  const ditherCheck = document.querySelector('#local-dither-check');
  const deleteBtn = document.querySelector('#delete-frame-btn');
  const histogramRadio = document.querySelector('#local-histogram');
  const medianCutRadio = document.querySelector('#local-median-cut');
  const modifiedHistogramRadio = document.querySelector('#local-modified-histogram');
  const kCutRadio = document.querySelector('#local-k-cut');
  const algoRadios = [histogramRadio, medianCutRadio, modifiedHistogramRadio, kCutRadio];

  const allControls = [
    histogramRadio,
    medianCutRadio,
    modifiedHistogramRadio,
    orderSelect,
    lengthSelect,
    ditherCheck,
    deleteBtn,
  ];

  const setOrder = (order) => {
    if (!frame.lct) {
      return;
    }
    frame.lct.order = order;

    let max = 256;
    if (frame.lct.algorithm === algorithms.HISTOGRAM) {
      max = order * order * order;
    } else if (frame.lct.algorithm === algorithms.MEDIAN_CUT) {
      max = 2 ** order;
    }
    if (max > 256) {
      max = 256;
    }

    let options = '<option>2</option>';
    let i = 2;
    let val = 2;
    while (i <= 8) {
      const temp = 2 ** i;
      if (temp > max) {
        break;
      }
      val = temp;
      options += `<option>${temp}</option>`;
      i += 1;
    }
    lengthSelect.innerHTML = options;

    if (frame.lct.ctLength > val) {
      frame.lct.ctLength = val;
    }
    lengthSelect.value = frame.lct.ctLength;
  };

  const setAlgorithm = (algorithm) => {
    for (let i = 0; i < algoRadios.length; i += 1) {
      const radio = algoRadios[i];
      if (algorithm === radio.value) {
        radio.checked = true;
        break;
      }
    }
  };

  const setDisabled = (disabled) => {
    if (disabled) {
      allControls.forEach((control) => {
        control.setAttribute('disabled', true);
      });
    } else {
      allControls.forEach((control) => {
        control.removeAttribute('disabled');
      });
    }
  };

  const setCT = () => {
    lengthSelect.value = frame.lct.ctLength;
    ditherCheck.checked = frame.lct.dither;
    setDisabled(false);
    setAlgorithm(frame.lct.algorithm);
    setOrder(frame.lct.order);
  };

  const clear = () => {
    setDisabled(true);
    useGCTCheck.setAttribute('disabled', true);
    frame = null;
  };

  algoRadios.forEach((radio) => {
    radio.addEventListener('input', (evt) => {
      if (evt.target.checked) {
        if (frame.lct) {
          frame.lct.algorithm = evt.target.value;
          setOrder(frame.lct.order);
        }
      }
    });
  });

  lengthSelect.addEventListener('change', () => {
    if (frame.lct) {
      frame.lct.ctLength = parseInt(lengthSelect.value, 10);
    }
  });

  orderSelect.addEventListener('change', () => setOrder(parseInt(orderSelect.value, 10)));

  ditherCheck.addEventListener('change', () => {
    if (frame && frame.lct) {
      frame.lct.dither = ditherCheck.checked;
    }
  });

  useGCTCheck.addEventListener('change', () => {
    if (!frame) {
      return;
    }

    if (useGCTCheck.checked) {
      frame.lct = null;
      setDisabled(true);
    } else {
      frame.lct = mixin({}, gct);
      setDisabled(false);
    }
  });

  emitter.subscribe(events.FRAME_SELECTED, (payload) => {
    frame = payload;
    ctx.drawImage(frame.image, 0, 0, canvas.width, canvas.height);
    useGCTCheck.removeAttribute('disbled');
    if (frame.lct) {
      setCT();
      useGCTCheck.checked = false;
    } else {
      setDisabled(true);
      useGCTCheck.checked = true;
    }
  });

  emitter.subscribe(events.CLEAR_FRAMES, () => {
    clear();
  });

  clear();
})();
