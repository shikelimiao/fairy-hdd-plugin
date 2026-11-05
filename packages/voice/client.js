window.__ModuleLoader__.load({
  id: '@local/dsh-fairy-voice',
  factory(require) {
    const React = require('react');
    const h = React.createElement;

    const TTS_BASE = 'http://127.0.0.1:9880/tts';
    const TTS_REF_AUDIO = '__FAIRY_ROOT__/voice/ref/fairy_ref.wav';
    const TTS_PROMPT = '了解我会如同主人使唤我一般使唤它，并且让它不敢有怨言。';
    const STORAGE_KEY = 'fairy.voice';

    // ---- 语音层归一化 ----
    // 合成器读不出罗马数字（「Ⅲ」会被跳过、读成方块或乱码），送 TTS 前转成中文读法。
    // 只动语音，不动文字层：聊天里仍然显示 FAIRY Ⅲ。
    const ROMAN_READINGS = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '十二'];
    const CANONICAL_ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];

    function normalizeForSpeech(text) {
      return String(text == null ? '' : text)
        // Ⅰ…Ⅻ（U+2160–U+216B）
        .replace(/[\u2160-\u216B]/g, (ch) => ROMAN_READINGS[ch.charCodeAt(0) - 0x2160])
        // ⅰ…ⅻ（U+2170–U+217B）
        .replace(/[\u2170-\u217B]/g, (ch) => ROMAN_READINGS[ch.charCodeAt(0) - 0x2170])
        // ASCII 写法只在带「型/号/期/代」后缀时转换，避免动到变量名、版本号与代码
        .replace(/(?<![A-Za-z0-9_])([IVX]{1,6})(?=(?:型|号|期|代))/g, (token) => {
          const index = CANONICAL_ROMAN.indexOf(token);
          return index < 0 ? token : ROMAN_READINGS[index];
        });
    }

    const CSS = `
.fv-tts {
  width: 28px; height: 28px; display: inline-flex; align-items: center; justify-content: center;
  padding: 0; border: 0; border-radius: 6px; background: transparent;
  color: #8fb0d0; cursor: default; margin-right: 2px;
}
.fv-tts:hover { background: rgba(90, 140, 210, 0.16); color: #dbe9f8; }
.fv-tts-on { color: #7fd8ff; text-shadow: 0 0 8px rgba(127, 216, 255, 0.55); }
`;

    // 默认开启：开关状态按 origin:port 隔离，重启后端口变化会丢失，所以默认发声
    let voiceEnabled = window.localStorage.getItem(STORAGE_KEY) !== '0';
    const listeners = new Set();

    function setVoice(value) {
      voiceEnabled = value;
      try { window.localStorage.setItem(STORAGE_KEY, value ? '1' : '0'); } catch (error) { /* ignore */ }
      listeners.forEach((fn) => fn());
    }

    function useVoice() {
      const [, force] = React.useReducer((x) => x + 1, 0);
      React.useEffect(() => {
        listeners.add(force);
        return () => { listeners.delete(force); };
      }, []);
      return voiceEnabled;
    }

    function VoiceToggle() {
      const on = useVoice();
      return h('button', {
        className: 'fv-tts' + (on ? ' fv-tts-on' : ''),
        type: 'button',
        title: on ? 'Fairy 语音：开' : 'Fairy 语音：关',
        onClick: () => setVoice(!voiceEnabled),
      },
        h('svg', {
          width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none',
          stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round', strokeLinejoin: 'round',
        },
          h('path', { d: 'M4 9.5h3.2L12 5.5v13L7.2 14.5H4z' }),
          on ? h('path', { d: 'M15.5 8.5a5 5 0 0 1 0 7' }) : null,
          on ? h('path', { d: 'M18 6a8.5 8.5 0 0 1 0 12' }) : null,
          on ? null : h('path', { d: 'M16 9.5l4 5M20 9.5l-4 5' }),
        ));
    }

    function VoiceBridge() {
      const on = useVoice();
      React.useEffect(() => {
        if (!on) return undefined;
        const audio = new Audio();
        let timer;
        let last = '';

        const speak = (text) => {
          const clean = normalizeForSpeech(text).replace(/\s+/g, ' ').trim();
          if (clean.length < 2 || clean === last) return;
          last = clean;
          const body = clean.slice(0, 400);
          const query = new URLSearchParams({
            text: body,
            text_lang: 'zh',
            ref_audio_path: TTS_REF_AUDIO,
            prompt_text: TTS_PROMPT,
            prompt_lang: 'zh',
            media_type: 'wav',
            streaming_mode: 'false',
            text_split_method: 'cut5',
            speed_factor: '1.0',
          });
          audio.src = TTS_BASE + '?' + query.toString();
          audio.play().catch(() => { /* 需要用户手势时才允许播放 */ });
        };

        const scan = () => {
          const nodes = document.querySelectorAll('[class*="_markdown"], [class*="_mdBody"]');
          if (nodes.length === 0) return;
          // 最后一个节点常常是空占位（光标 / 骨架），从后往前找第一个真有文字的
          let picked = '';
          for (let i = nodes.length - 1; i >= 0 && !picked; i -= 1) {
            const value = String(nodes[i].textContent || '').trim();
            if (value.length > 1) picked = value;
          }
          if (picked) speak(picked);
        };

        const observer = new MutationObserver(() => {
          clearTimeout(timer);
          timer = setTimeout(scan, 600);
        });
        observer.observe(document.body, { childList: true, subtree: true, characterData: true });
        return () => {
          observer.disconnect();
          clearTimeout(timer);
          audio.pause();
          audio.src = '';
        };
      }, [on]);
      return null;
    }

    return {
      inject: ['slots'],
      apply(ctx) {
        ctx.effect(() => {
          const el = document.createElement('style');
          el.id = 'fairy-voice-css';
          el.textContent = CSS;
          const stale = document.getElementById('fairy-voice-css');
          if (stale) stale.remove();
          document.head.appendChild(el);
          return () => el.remove();
        }, 'fairy-voice: styles');

        ctx.slots.inject('conversation.input.right', () => ctx.slots.register(
          { name: 'conversation.input.right', id: 'fairy-voice-toggle', order: 3 }, VoiceToggle));
        ctx.slots.inject('shell.overlay', () => ctx.slots.register(
          { name: 'shell.overlay', id: 'fairy-voice-bridge', order: 96 }, VoiceBridge));
      },
    };
  },
});
