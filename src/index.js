import eventEmitter from './lib/event-emitter';
import mixin from './lib/mixin';
import test from './testScript';
import './assets/css/style.scss';

// TODO: Remove //////////////////////////////////////////
import testVideo from './assets/images/video.mp4';

(() => {
  document.querySelector('#player').src = testVideo;
})();
// ////////////////////////////////////////////////////////

const newSlider = (
  () => (parent, label, min = 0, max = 10, initialValue = 5, precision = 1, valueWidth = 30) => {
    const sliderGroup = document.createElement('div');
    sliderGroup.classList.add('control-group', 'slider-group', 'flex-1');
    parent.append(sliderGroup);

    const labelSpan = document.createElement('span');
    labelSpan.textContent = label;
    sliderGroup.append(labelSpan);

    const slideLine = document.createElement('div');
    slideLine.classList.add('slider-line');
    const fill = document.createElement('div');
    fill.classList.add('fill');
    slideLine.append(fill);
    const knob = document.createElement('knob');
    knob.classList.add('knob');
    fill.append(knob);
    sliderGroup.append(slideLine);

    const valueSpan = document.createElement('span');
    valueSpan.classList.add('slider-value-span');
    valueSpan.style.width = `${valueWidth}px`;
    sliderGroup.append(valueSpan);

    const range = max - min;
    const delta = 0.01;
    let dragging = false;
    let valueChangedListener;
    let value;
    let width;

    const valueChange = (newWidth, newValue) => {
      width = newWidth;
      value = newValue;
      fill.style.width = `${width}px`;
      valueSpan.textContent = precision === 0 ? Math.round(value) : value.toFixed(precision);
      if (valueChangedListener) {
        valueChangedListener(value);
      }
    };

    valueChange((((initialValue - min) / range) * (slideLine.clientWidth - 2)), initialValue);

    const reinit = () => {
      width = (((initialValue - min) / range) * (slideLine.clientWidth - 2));
      fill.style.width = `${width}px`;
    };

    const drag = (e) => {
      let tempWidth = e.clientX - fill.getBoundingClientRect().x;
      const maxWidth = slideLine.clientWidth - 2;
      if (tempWidth <= 0) {
        if (width === 0) return;
        tempWidth = 0;
        value = min;
      } else if (tempWidth > maxWidth) {
        if (width === maxWidth) return;
        tempWidth = maxWidth;
        value = max;
      } else {
        if (Math.abs(tempWidth - width) < delta) return;
        value = min + ((range * tempWidth) / maxWidth);
      }
      valueChange(tempWidth, value);
    };

    const mouseup = () => {
      dragging = false;
      document.removeEventListener('mousemove', drag);
      document.removeEventListener('mouseup', mouseup);
    };

    knob.addEventListener('mousedown', (e) => {
      dragging = true;
      document.addEventListener('mouseup', mouseup);
      document.addEventListener('mousemove', (e2) => {
        if (dragging) {
          drag(e2);
        }
      });
      drag(e);
    });

    slideLine.addEventListener('click', drag);

    return {
      set onValueChanged(callback) {
        valueChangedListener = callback;
      },
      get value() {
        return value;
      },
      reinit,
    };
  }
)();

// const thumbnailDimensions = { width: 320, height: 200 };
const emitter = eventEmitter();
const events = {
  CLEAR_FRAMES: 'clear frames',
  GRAB_FRAME: 'grab frame',
  FRAME_SELECTED: 'frame selected',
  FRAME_SELECTION_CLEARED: 'frame selection cleared',
  LOCK_CANVAS_DIMENSIONS: 'lock_dimensions',
  SIMULATION_TAB_FIRST_TIME_OPEN: 'simulation_tab_open',
  GCT_FRAME_CHANGE: 'gct_frame_change',
};

const lengthOptions = (() => {
  const MAX = 256;
  let options = '';
  let current = 2;
  while (current < MAX) {
    options += `<option>${current}</option>`;
    current *= 2;
  }
  return options;
})();

const algorithms = {
  HISTOGRAM: 'Histogram',
  MEDIAN_CUT: 'Median Cut',
  MODIFIED_HISTOGRAM: 'Modified Histogram',
  K_CUT: 'K Means',
};

// Default Color Table
const DCT = {
  algorithm: algorithms.MEDIAN_CUT, dither: true, index: 0, length: 256,
};

const gct = (() => {
  let ct = DCT;
  ct = mixin({}, ct);

  const lengthSelect = document.querySelector('#gct-length-select');
  lengthSelect.innerHTML = lengthOptions;
  const ditherCheck = document.querySelector('#gct-dither-check');

  const algoRadios = document.querySelectorAll('.gct-algo-radio');

  algoRadios.forEach((radio) => {
    radio.addEventListener('input', (evt) => {
      if (evt.target.checked) {
        ct.algorithm = evt.target.value;
      }
    });
  });

  ditherCheck.addEventListener('change', () => {
    ct.dither = ditherCheck.checked;
  });

  lengthSelect.addEventListener('change', () => {
    ct.length = lengthSelect.value;
  });

  return {
    get ct() { return ct; },
    setFrame: (frame) => {
      if (!frame.lct) return;
      ct = mixin({}, frame.lct);
      ct.algorithm = frame.lct.algorithm;
      ct.length = frame.lct.length;
      lengthSelect.value = ct.length;
      ct.dither = frame.lct.dither;
      ditherCheck.checked = ct.dither;
      for (let i = 0, n = algoRadios.length; i < n; i += 1) {
        const radio = algoRadios.item(i);
        if (radio.value === ct.algorithm) {
          radio.checked = true;
          break;
        }
      }
    },
  };
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

const supportsFileReader = window.FileReader && window.Blob;

const getMimeType = (file) => {
  if (supportsFileReader) {
    return new Promise((resolve) => {
      // https://stackoverflow.com/a/29672957
      const fileReader = new FileReader();
      fileReader.onloadend = (e) => {
        const arr = (new Uint8Array(e.target.result)).subarray(0, 4);
        let header = '';
        for (let i = 0; i < arr.length; i += 1) {
          header += arr[i].toString(16);
        }
        let type = '';
        switch (header) {
          case '89504e47':
            type = 'image/png';
            break;
          case '47494638':
            type = 'image/gif';
            break;
          case 'ffd8ffe0':
          case 'ffd8ffe1':
          case 'ffd8ffe2':
          case 'ffd8ffe3':
          case 'ffd8ffe8':
            type = 'image/jpeg';
            break;
          default:
            type = 'unknown'; // Or you can use the blob.type as fallback
            break;
        }
        resolve(type);
      };
      fileReader.readAsArrayBuffer(file);
    });
  }
  return Promise.resolve(file.type);
};

const imageImporter = (() => {
  const fileInput = document.querySelector('#import-image-file');
  const supportedMimes = ['image/png', 'image/jpeg'];
  const reset = () => {
    fileInput.value = '';
  };

  fileInput.addEventListener('change', () => {
    const file = fileInput.files && fileInput.files[0];
    if (!file) return;
    getMimeType(file).then((mime) => {
      if (supportedMimes.indexOf(mime) < 0) {
        feedBack.error('Unsupported file type');
        return;
      }
      const img = new Image();
      img.onload = () => {
        emitter.emit(events.GRAB_FRAME, img);
        URL.revokeObjectURL(file);
        reset();
      };
      img.src = URL.createObjectURL(file);
    }).catch((err) => {
      let msg = 'Unable to import file';
      if (err instanceof Error) {
        if (err.message) {
          msg = err.message;
        }
      } else if (typeof err === 'string') {
        msg = err;
      }
      feedBack.error(msg);
      reset();
    });
  });

  return {
    click: () => fileInput.click(),
  };
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
  const content = document.querySelector('#content');
  let open = true;

  hamburger.addEventListener('click', () => {
    if (open) {
      hamburger.classList.remove('open');
      content.classList.remove('sidebar-open');
    } else {
      hamburger.classList.add('open');
      content.classList.add('sidebar-open');
    }
    open = !open;
  });
})();

// Setup Sidebar TabControl
(() => {
  const tabHeaders = document.querySelectorAll('.tab-header');
  let activeTabHeader;
  let activeTabItem;
  let simulationTabOpened = false;

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
      const id = header.getAttribute('data-tab');
      activeTabItem = document.querySelector(id);
      activeTabItem.classList.add('active');
      header.classList.add('active');

      if (!simulationTabOpened && id === '#simulation-wrap') {
        simulationTabOpened = true;
        emitter.emit(events.SIMULATION_TAB_FIRST_TIME_OPEN);
      }
    });

    if (header.classList.contains('active')) {
      header.click();
    }
  });
})();

const configuration = (() => {
  const MAX_CANVAS_WIDTH = 320;
  const MAX_CANVAS_HEIGHT = 200;
  let canvasWidth = 320;
  let canvasHeight = 200;
  let delay = 10;
  let width = 320;
  let height = 200;

  newSlider(
    document.querySelector('#canvas-width-slider-group'),
    'Width', 0, MAX_CANVAS_WIDTH, canvasWidth, 0, 50,
  ).onValueChanged = (value) => {
    width = value;
  };

  newSlider(
    document.querySelector('#canvas-height-slider-group'),
    'Height', 0, MAX_CANVAS_HEIGHT, canvasHeight, 0, 50,
  ).onValueChanged = (value) => {
    height = value;
  };

  const lockDimensions = () => {
    canvasWidth = Math.round(width);
    canvasHeight = Math.round(height);
  };

  document.querySelector('#lock-dimensions-btn').addEventListener('click', () => {
    emitter.emit(events.LOCK_CANVAS_DIMENSIONS);
  });

  return {
    get canvasWidth() { return canvasWidth; },
    get canvasHeight() { return canvasHeight; },
    get delay() { return delay; },
    set delay(val) { delay = val; },
    lockDimensions,
    toPojo: () => ({ canvas: { width: canvasWidth, height: canvasHeight }, delay }),
  };
})();

// Video Player
(() => {
  const video = document.querySelector('#player');
  const startText = document.querySelector('#frame-start-text');
  const MAX_DURATION = 5;
  let loaded = false;
  let start = 0;
  let duration = 1;
  let fps = 12; // Frames per second

  newSlider(
    document.querySelector('#duration-slider-group'),
    'Duration', 0, MAX_DURATION, 1, 1,
  ).onValueChanged = (value) => {
    duration = value;
  };

  newSlider(
    document.querySelector('#frame-rate-slider-group'),
    'Frame Rate', 1, 30, 12, 0,
  ).onValueChanged = (value) => {
    fps = Math.round(value);
  };

  video.onerror = () => {
    loaded = false;
  };
  video.onloadstart = () => {
    loaded = true;
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

  document.querySelector('#clear-frames-btn').addEventListener('click', () => {
    emitter.emit(events.CLEAR_FRAMES);
  });

  const grab = (time, grabbedFrames, totalFrames, interval, callback) => setTimeout(() => {
    if (grabbedFrames >= totalFrames) {
      callback();
      return;
    }
    video.currentTime = time;
    emitter.emit(events.GRAB_FRAME, video);
    grab(time + interval, grabbedFrames + 1, totalFrames, interval, callback);
  }, 100);

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
    emitter.emit(events.LOCK_CANVAS_DIMENSIONS);
    const tempTime = video.currentTime;
    const total = Math.floor(fps * duration);
    grab(start, 0, total, 1 / fps, () => {
      video.currentTime = tempTime;
      busy.set(false);
    });
  });
})();

const thumbnail = (() => {
  let draggedImage;
  let dropped = false;
  let hasImages = false;
  let gctFrame = null;
  let selectedFrame = null;
  let selections = [];
  let width = configuration.canvasWidth;
  let height = configuration.canvasHeight;

  let frames = [];

  let nextInsertId = 1;

  const indexOf = (element, children) => {
    for (let i = 0, n = children.length; i < n; i += 1) {
      const child = children[i];
      if (child === element) return i;
    }
    return -1;
  };

  const clearSelections = () => {
    selections.forEach((frame) => frame.image.classList.remove('selected'));
    selections = [];
  };

  const selectFrame = (frame) => {
    clearSelections();
    selectedFrame = frame;
    selectedFrame.image.classList.add('selected');
    selections.push(frame);
    emitter.emit(events.FRAME_SELECTED, frame);
  };

  const contextMenu = (() => {
    const menu = document.createElement('div');
    menu.classList.add('thumnail-context-menu');

    const deleteBtn = document.createElement('a');
    deleteBtn.classList.add('menu-item');
    deleteBtn.textContent = 'Delete';
    menu.append(deleteBtn);

    const isGCTBtn = document.createElement('a');
    isGCTBtn.classList.add('menu-item');
    isGCTBtn.textContent = 'Set As GCT Image';
    menu.append(isGCTBtn);

    const previewBtn = document.createElement('a');
    previewBtn.classList.add('menu-item');
    previewBtn.textContent = 'Preview';
    menu.append(previewBtn);

    const convertBtn = document.createElement('a');
    convertBtn.classList.add('menu-item');
    convertBtn.textContent = 'Convert';
    menu.append(convertBtn);

    const importImageBtn = document.createElement('a');
    importImageBtn.classList.add('menu-item');
    importImageBtn.textContent = 'Import Image';
    menu.append(importImageBtn);

    let attached = false;

    const defaultHandler = (e) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const close = () => {
      document.removeEventListener('mousedown', close);
      menu.remove();
      attached = false;
      deleteBtn.onclick = defaultHandler;
      isGCTBtn.onclick = defaultHandler;
      previewBtn.onclick = defaultHandler;
      convertBtn.onclick = defaultHandler;
      importImageBtn.onclick = defaultHandler;
    };

    // deleteBtn.onclick = () => {
    //   document.addEventListener('mousedown', close);
    // };

    menu.oncontextmenu = (e) => e.preventDefault();
    // menu.onclick = (e) => e.stopPropagation();
    // eslint-disable-next-line no-script-url
    deleteBtn.href = 'javascript:void()';

    const show = (frame, x, y) => {
      close();
      menu.style.visibility = 'hidden';
      if (frame !== null) {
        deleteBtn.classList.remove('disabled');
        deleteBtn.onclick = (e) => {
          e.preventDefault();
          selections.forEach((frame) => frame.remove());
        };
        if (selections.length > 1) {
          isGCTBtn.classList.add('disabled');
          previewBtn.classList.add('disabled');
          convertBtn.classList.add('disabled');
        } else {
          if (frame.lct) {
            isGCTBtn.onclick = (e) => {
              e.preventDefault();
              frame.setAsGCT();
            };
            isGCTBtn.classList.remove('disabled');
          } else {
            isGCTBtn.classList.add('disabled');
          }
          previewBtn.onclick = (e) => {
            if (selections.length > 1) return;
            e.preventDefault();
            frame.preview();
          };
          convertBtn.onclick = (e) => {
            if (selections.length > 1) return;
            e.preventDefault();
            frame.convert();
          };

          previewBtn.classList.remove('disabled');
          convertBtn.classList.remove('disabled');
        }
      } else {
        deleteBtn.classList.add('disabled');
        isGCTBtn.classList.add('disabled');
        previewBtn.classList.add('disabled');
        convertBtn.classList.add('disabled');
      }
      importImageBtn.onclick = () => imageImporter.click();
      document.addEventListener('click', close);

      if (!attached) {
        document.body.append(menu);
        attached = true;
      }
      setTimeout(() => {
        const right = document.body.clientWidth - x;
        const bottom = document.body.clientHeight - y;
        if (right < menu.clientWidth) {
          menu.style.removeProperty('left');
          menu.style.right = `${right}px`;
        } else {
          menu.style.removeProperty('right');
          menu.style.left = `${x}px`;
        }
        if (bottom < menu.clientHeight) {
          menu.style.removeProperty('top');
          menu.style.bottom = `${bottom}px`;
        } else {
          menu.style.removeProperty('bottom');
          menu.style.top = `${y}px`;
        }
        menu.style.visibility = 'visible';
      }, 10);
    };

    return {
      show,
    };
  })();

  const eventPosition = (elemt, evt) => {
    const rect = elemt.getBoundingClientRect();
    return {
      x: evt.clientX - rect.left,
      y: evt.clientY - rect.top,
    };
  };

  let containerBG;

  const container = (() => {
    containerBG = document.querySelector('#thumbnails-bg');
    const con = document.querySelector('#thumbnails-container');
    containerBG.style.maxHeight = `${containerBG.clientHeight}px`;
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

  const findFrame = (id) => {
    for (let i = 0, n = frames.length; i < n; i += 1) {
      if (frames[i].id === id) {
        return frames[i];
      }
    }
    return null;
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

  container.oncontextmenu = (e) => {
    e.preventDefault();
    contextMenu.show(null, e.clientX, e.clientY);
  };

  containerBG.oncontextmenu = (e) => {
    e.preventDefault();
    contextMenu.show(null, e.clientX, e.clientY);
  };

  const createCanvas = (video) => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const element = new Image();
    element.width = canvas.width;
    element.height = canvas.height;
    element.classList.add('thumbnail');
    element.src = canvas.toDataURL('image/png');
    element.setAttribute('data-id', nextInsertId);

    container.append(element);

    const frame = {
      image: element,
      canvas,
      lct: null,
      id: nextInsertId,
      selected: false,
      isGCTImage: false,
      remove: () => {
        frames = frames.filter((f) => f !== frame);
        element.remove();
        if (frame.selected) {
          selections = selections.filter((f) => f !== frame);
        }
        if (selectedFrame === frame) {
          selectedFrame = null;
          emitter.emit(events.FRAME_SELECTION_CLEARED);
        }
      },
      setAsGCT: () => {
        if (frame.isGCTImage) return;
        if (gctFrame) gctFrame.isGCTImage = false;
        gctFrame = frame;
        frame.isGCTImage = true;
        gct.setFrame(frame);
        frame.lct = null;
        emitter.emit(events.GCT_FRAME_CHANGE);
      },
      preview: () => {},
      convert: () => {},
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

    element.addEventListener('click', (e) => {
      if (e.shiftKey) {
        if (selectedFrame !== null) {
          const { children } = container;
          let start = indexOf(selectedFrame.image, children);
          let end = indexOf(element, children);
          if (start > end) {
            const temp = start;
            start = end;
            end = temp;
          }
          clearSelections();
          for (let i = start; i <= end; i += 1) {
            const child = children.item(i);
            const id = parseInt(child.getAttribute('data-id'), 10);
            const f = findFrame(id);
            if (f) {
              f.image.classList.add('selected');
              selections.push(f);
            }
          }
          return;
        }
      } else if (e.ctrlKey) {
        if (indexOf(frame, selections) < 0) {
          selections.push(frame);
          element.classList.add('selected');
        } else {
          selections = selections.filter((f) => f !== frame);
          element.classList.remove('selected');
          if (frame === selectedFrame) {
            selectedFrame = null;
            emitter.emit(events.FRAME_SELECTION_CLEARED);
          }
        }
        return;
      }
      selectFrame(frame);
    });

    element.oncontextmenu = (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (indexOf(frame, selections) < 0) {
        selectFrame(frame);
      }
      contextMenu.show(frame, e.clientX, e.clientY);
    };

    return frame;
  };

  emitter.subscribe(events.LOCK_CANVAS_DIMENSIONS, () => {
    if (frames.length > 0) {
      feedBack.error(`You have frames that are locked at (${width} X ${height}).\nPlease clear your current frames to lock to a new dimension.`);
      return;
    }
    configuration.lockDimensions();
    width = configuration.canvasWidth;
    height = configuration.canvasHeight;
  });

  emitter.subscribe(events.CLEAR_FRAMES, () => {
    container.innerHTML = '';
    frames = [];
    selections = [];
    selectedFrame = null;
    emitter.emit(events.FRAME_SELECTION_CLEARED);
    hasImages = false;
  });

  emitter.subscribe(events.GRAB_FRAME, (video) => {
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
    hasImages: () => hasImages,
  };
})();

// Simulation
(() => {
  const canvas = document.querySelector('#simulation-canvas');
  const ctx = canvas.getContext('2d');
  const simulateBtn = document.querySelector('#simulation-btn');

  let reverse = true;
  let stopped = true;
  let delay = 100;

  const delaySlider = newSlider(
    document.querySelector('#delay-slider-group'),
    'Delay', 1, 100, configuration.delay, 0,
  );
  delaySlider.onValueChanged = (value) => {
    delay = 10 * value;
    configuration.delay = Math.round(value);
  };
  emitter.subscribe(events.SIMULATION_TAB_FIRST_TIME_OPEN, () => {
    delaySlider.reinit();
  });

  document.querySelector('#simulation-reverse-check').addEventListener('input', (evt) => {
    reverse = evt.target.checked;
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
    if (!thumbnail.hasImages()) {
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
  const lengthSelect = document.querySelector('#lct-length-select');
  lengthSelect.innerHTML = lengthOptions;
  const ditherCheck = document.querySelector('#local-dither-check');
  const deleteBtn = document.querySelector('#delete-frame-btn');
  const histogramRadio = document.querySelector('#local-histogram');
  const medianCutRadio = document.querySelector('#local-median-cut');
  const modifiedHistogramRadio = document.querySelector('#local-modified-histogram');
  const kCutRadio = document.querySelector('#local-k-cut');
  const algoRadios = [histogramRadio, medianCutRadio, modifiedHistogramRadio, kCutRadio];

  const isGCTDisplay = document.querySelector('#gct-image-display');

  const allControls = [
    histogramRadio,
    medianCutRadio,
    modifiedHistogramRadio,
    lengthSelect,
    ditherCheck,
    deleteBtn,
  ];

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
    lengthSelect.value = frame.lct.length;
    ditherCheck.checked = frame.lct.dither;
    setDisabled(false);
    setAlgorithm(frame.lct.algorithm);
  };

  const clearCanvas = () => {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const clear = () => {
    setDisabled(true);
    useGCTCheck.setAttribute('disabled', true);
    frame = null;
    isGCTDisplay.classList.remove('is-gct');
  };

  algoRadios.forEach((radio) => {
    radio.addEventListener('input', (evt) => {
      if (evt.target.checked) {
        if (frame.lct) {
          frame.lct.algorithm = evt.target.value;
        }
      }
    });
  });

  lengthSelect.addEventListener('change', () => {
    if (frame.lct) {
      frame.lct.length = parseInt(lengthSelect.value, 10);
    }
  });

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
    clearCanvas();
    ctx.drawImage(frame.image, 0, 0, canvas.width, canvas.height);
    if (frame.isGCTImage) {
      setDisabled(true);
      useGCTCheck.setAttribute('disabled', true);
      isGCTDisplay.classList.add('is-gct');
    } else {
      isGCTDisplay.classList.remove('is-gct');
      useGCTCheck.removeAttribute('disabled');
      if (frame.lct) {
        setCT();
        useGCTCheck.checked = false;
      } else {
        setDisabled(true);
        useGCTCheck.checked = true;
      }
    }
  });

  emitter.subscribe(events.GCT_FRAME_CHANGE, () => {
    setDisabled(true);
    useGCTCheck.setAttribute('disabled', true);
    isGCTDisplay.classList.add('is-gct');
  });

  emitter.subscribe(events.FRAME_SELECTION_CLEARED, () => {
    clearCanvas();
    clear();
  });

  clear();
})();

document.querySelector('#process-btn').onclick = () => {
  const frames = thumbnail.frames();
  const config = configuration.toPojo();
  let gctConfig = gct.ct;
  gctConfig = mixin({}, gctConfig);
  frames.forEach((frame, i) => {
    if (frame.isGCTImage) {
      gctConfig.index = i;
    }
  });
  config.gct = gctConfig;
  console.log(config);
};

test.run();
