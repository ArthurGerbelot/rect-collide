import { fixFloat } from '../../src/helpers';

const Settings = {

  root:null,
  TemplateSettings: null,

  rectSettings: [], // Settings per rect {el: DOM Element, refs: {}, settings: {}}
  settings: {}, // Global settings

  init ({settings, rects, onPlay, onPause, onRectChange}) {

    Settings.root = document.getElementById('rect-settings');
    Settings.TemplateSettings = document.getElementById('rect-settings-template');

    Settings.settings = settings;

    // Clean
    Settings.root.innerHTML = "";
    // Create from Template
    Settings.rectSettings = rects.map((rect, idx) => {
      return cloneTemplate({rect, idx});
    });

    // Append all
    Settings.rectSettings.forEach(rectSetting => {
      Settings.root.appendChild(rectSetting.el);

      addRectSettingEvents(rectSetting, onRectChange);
    });

    // Actions
    Array.from(document.getElementsByClassName('action')).forEach(action => {
      action.addEventListener('click', () => {
        if (action.dataset.action == "play") {
          onPlay && onPlay();
        }
        else if (action.dataset.action == "pause") {
          onPause && onPause();
        }
      })
    })
  },

  // Values has been updated
  refresh(rects) {
    Settings.rectSettings.forEach(rectSetting => {
      refreshSetting({
          ...rectSetting,
        settings: rects[rectSetting.idx],
      });
    });
  },

  // Manually refresh settings for moving rect.
  refreshOnMove(rect) {
    // Manually redraw settings.
    document.querySelector('#rect-1 input[type="range"].x').value = parseInt(rect.x);
    document.querySelector('#rect-1 input[type="range"].y').value = parseInt(rect.y);
    document.querySelector('#rect-1 .x-value').innerHTML = parseInt(rect.x);
    document.querySelector('#rect-1 .y-value').innerHTML = parseInt(rect.y);

  },

  get(key){
    return Settings.settings[key];
  },

};


export default Settings;


// ---- Intern ----

const cloneTemplate = ({rect, idx}) => {

  let el = Settings.TemplateSettings.cloneNode(true);

  const classes = [
    'title',
    'x', 'y', 'w', 'h', 'angle', 'speed',
    'x-value', 'y-value', 'w-value', 'h-value', 'angle-value', 'speed-value',
    'axes', 'corners'
  ];

  let rectSetting = {
      el,
      refs: Object.fromEntries(classes.map(key => [key, Array.from(el.getElementsByClassName(key))[0]])),
      idx,
      settings: rect
  }

  // Attr
  el.id = `rect-${idx}`;
  el.style=`--primary-color:rgb(${rect.rgb})`;

  // Title
  rectSetting.refs.title.innerHTML = rect.label;

  refreshSetting(rectSetting);

  return rectSetting;
}

// Refresh DOM
const toLi = arr => `<ul>${arr.map(item => `<li>${item}</li>`).join('')}</ul>`;
const renderLabel = (label, value) => `<span class="label">${label}:</span> ${fixFloat(value, 2)}`;
const refreshSetting = ({ refs, settings}, skipInputs=false) => {
  const classes = [
    'x', 'y', 'w', 'h', 'angle', 'speed',
  ];
  classes.forEach(key => {
    if (!skipInputs) {
      refs[key].value = parseInt(settings[key]) || 0;
    }
    refs[`${key}-value`].innerHTML = fixFloat(settings[key], 2);
  });
};

const addRectSettingEvents = (rectSetting, onRectChange) => {
  const classes= [
    'x', 'y', 'w', 'h', 'angle', 'speed',
  ];
  rectSetting.el.querySelectorAll('input[type="range"]').forEach(input => {
    input.addEventListener('input', () => {
      // Update rect with settings
      const rect = {
        ...rectSetting.settings,
        ...Object.fromEntries(classes.map(key => [
          key,
          parseFloat(rectSetting.refs[key].value),
        ])),
      };

      // Refresh labels (without inputs)
      refreshSetting({...rectSetting, settings: rect}, true);

      // Propagate
      onRectChange({
        idx: rectSetting.idx,
        rect,
      })
    });
  })
};