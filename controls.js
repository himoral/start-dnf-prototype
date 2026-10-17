(function (global) {
  'use strict';

  // These are illustrative mappings, not live game or cooldown data.
  var ROLES = {
    damage: {
      daily: ['拔刀斩', '猛龙断空斩', '幻影剑舞'],
      small: ['流心·刺', '流心·跃', '流心·升', '破军升龙击'],
      big: ['拔刀斩', '猛龙断空斩', '幻影剑舞', '破空拔刀斩'],
      buff: ['破极兵刃', '流心·狂', '装备增益'],
      other: ['主动装备', '誓约技能', '一觉技能'],
      third: '三觉技能'
    },
    support: {
      daily: ['神光十字', '勇气圣歌', '新生圣歌'],
      small: ['治愈祈祷', '神光惩戒', '胜利之矛', '神圣锁环'],
      big: ['神光十字', '勇气圣歌', '新生圣歌', '圣佑之阵'],
      buff: ['勇气祝福', '守护祝福', '圣洁之翼'],
      other: ['主动装备', '誓约技能', '一觉技能'],
      third: '辅助三觉'
    }
  };

  function create(options) {
    options = options || {};
    var root = options.root;
    if (!root || !root.ownerDocument) throw new TypeError('DNFControls requires a DOM root.');
    var doc = root.ownerDocument;
    var win = doc.defaultView || global;
    var mode = 'click';
    var role = 'damage';
    var destroyed = false;
    var pointers = new Map();
    var groups = {};
    var wheel = null;
    var wheelOwner = null;
    var buffQueue = null;
    var buffTimer = null;
    var buffStatus = null;
    var buffCancelButton = null;
    root.classList.add('dnf-controls');
    root.style.setProperty('--dnf-control-opacity', '0.86');

    function hint(message) {
      if (!destroyed && typeof options.onHint === 'function') options.onHint(message);
    }
    function emit(type, name, extra) {
      if (destroyed) return;
      if (typeof options.onAction === 'function') {
        options.onAction(Object.assign({ type: type, name: name, mode: mode, role: role }, extra || {}));
      }
    }
    function element(tag, className, text) {
      var node = doc.createElement(tag);
      node.className = className || '';
      if (text) node.textContent = text;
      return node;
    }
    function button(id, label, sub, className) {
      var node = element('button', 'dnf-control ' + (className || ''));
      node.type = 'button';
      node.dataset.control = id;
      node.setAttribute('aria-label', label + (sub ? '，' + sub : ''));
      node.appendChild(element('span', 'dnf-control-label', label));
      if (sub) node.appendChild(element('span', 'dnf-control-sub', sub));
      root.appendChild(node);
      return node;
    }
    function group(id, title, skills, sub, isBuff) {
      groups[id] = { title: title, skills: skills.slice(), isBuff: !!isBuff };
      var node = button(id, title, sub || skills[0], 'dnf-skill-group dnf-pos-' + id);
      node.dataset.skillGroup = id;
      node.setAttribute('aria-haspopup', 'true');
      node.setAttribute('aria-expanded', 'false');
      node.title = (isBuff ? '短按模拟全部 BUFF 输入；滑动可单独补放。' : '短按释放 ' + skills[0] + '；滑动选择其他技能。') + '技能为示例映射。';
      return node;
    }
    function refreshBuff() {
      if (buffStatus) {
        buffStatus.hidden = !buffQueue;
        buffStatus.textContent = buffQueue ? 'BUFF 输入模拟 ' + buffQueue.index + '/' + buffQueue.skills.length + ' · 效果未核验' : '';
      }
      if (buffCancelButton) buffCancelButton.hidden = !buffQueue;
      var node = root.querySelector('[data-control="buff"]');
      if (node) {
        node.classList.toggle('is-running', !!buffQueue);
        node.setAttribute('aria-busy', buffQueue ? 'true' : 'false');
      }
    }
    function stopBuff(reason) {
      if (buffTimer !== null) win.clearTimeout(buffTimer);
      buffTimer = null;
      var old = buffQueue;
      buffQueue = null;
      refreshBuff();
      if (old) emit('buffCancel', 'BUFF 输入已停止', { completedInputs: old.index, reason: reason || 'cancel', simulated: true });
    }
    function startBuff() {
      if (buffQueue) { hint('BUFF 输入队列正在执行，可取消；不会重复启动。'); return; }
      var queue = { skills: ROLES[role].buff.slice(), index: 0 };
      buffQueue = queue;
      refreshBuff();
      emit('buffStart', '全部 BUFF', { skills: queue.skills.slice(), simulated: true });
      hint('正在模拟 3 个 BUFF 的输入，不代表游戏内效果已生效。');
      function next() {
        if (destroyed || buffQueue !== queue) return;
        if (queue.index >= queue.skills.length) {
          buffQueue = null;
          buffTimer = null;
          refreshBuff();
          emit('buffEnd', 'BUFF 输入序列完成', { simulated: true, effectVerified: false });
          hint('BUFF 输入模拟完成；实际生效结果需要在游戏内核验。');
          return;
        }
        var skill = queue.skills[queue.index++];
        refreshBuff();
        emit('buffStep', skill, { group: 'buff', step: queue.index, total: queue.skills.length, simulated: true });
        if (buffQueue === queue && !destroyed) buffTimer = win.setTimeout(next, 650);
      }
      if (buffQueue === queue) next();
    }
    function hideWheel() {
      if (wheel) wheel.remove();
      wheel = null;
      wheelOwner = null;
    }
    function showWheel(state) {
      hideWheel();
      wheelOwner = state.id;
      wheel = element('div', 'dnf-skill-wheel');
      wheel.setAttribute('role', 'status');
      wheel.setAttribute('aria-live', 'polite');
      wheel.dataset.skillGroup = state.groupId;
      wheel.appendChild(element('div', 'dnf-wheel-title', state.group.title + ' · 滑选预览'));
      var dial = element('div', 'dnf-wheel-dial');
      var center = element('div', 'dnf-wheel-center', '滑动选择');
      dial.appendChild(center);
      state.group.skills.forEach(function (name, index) {
        var angle = -Math.PI / 2 + index * Math.PI * 2 / state.group.skills.length;
        var item = element('div', 'dnf-wheel-item', name);
        item.dataset.skillIndex = String(index);
        item.style.left = (50 + 35 * Math.cos(angle)) + '%';
        item.style.top = (50 + 35 * Math.sin(angle)) + '%';
        dial.appendChild(item);
      });
      wheel.appendChild(dial);
      wheel.appendChild(element('div', 'dnf-wheel-selection', state.group.isBuff ? '短按：全部 BUFF 输入模拟' : '短按：' + state.group.skills[0]));
      wheel.appendChild(element('div', 'dnf-wheel-tip', '按住滑动 · 松手释放一个 · 回中心或拖远取消'));
      root.appendChild(wheel);
      state.node.setAttribute('aria-expanded', 'true');
    }
    function updateWheel(state) {
      if (!wheel || wheelOwner !== state.id) return;
      wheel.querySelectorAll('[data-skill-index]').forEach(function (node) {
        node.classList.toggle('is-selected', Number(node.dataset.skillIndex) === state.selected);
      });
      var selected = state.selected >= 0;
      wheel.classList.toggle('is-cancelling', !selected && state.everSlid);
      wheel.querySelector('.dnf-wheel-center').textContent = selected ? '松手释放' : (state.everSlid ? '松手取消' : '滑动选择');
      wheel.querySelector('.dnf-wheel-selection').textContent = selected ? state.group.skills[state.selected] : (state.everSlid ? '已取消选择' : '长按不会触发；滑动选择一个技能');
    }
    function releaseCapture(state) {
      try { if (state.node.hasPointerCapture(state.id)) state.node.releasePointerCapture(state.id); } catch (_) {}
    }
    function cancelPointer(state, reason) {
      pointers.delete(state.id);
      if (state.holdTimer) win.clearTimeout(state.holdTimer);
      state.node.classList.remove('is-pressed');
      state.node.setAttribute('aria-expanded', 'false');
      if (state.kind === 'move') {
        state.node.style.setProperty('--stick-x', '0px');
        state.node.style.setProperty('--stick-y', '0px');
        emit('move', '停止移动', { active: false, x: 0, y: 0, direction: 'center', cancelled: reason !== 'release' });
      } else if (state.kind === 'attack') {
        emit('attack', '普通攻击', { phase: 'up', cancelled: reason !== 'release' });
      }
      if (wheelOwner === state.id) hideWheel();
      releaseCapture(state);
    }
    function cancel(reason) {
      Array.from(pointers.values()).forEach(function (state) { cancelPointer(state, reason || 'cancel'); });
      hideWheel();
      stopBuff(reason || 'cancel');
    }
    function action(id) {
      var names = { loot: '拾取 / 吸取', retry: '再次挑战', exit: '退出地下城', potion: '使用药品', jump: '跳跃', special: '队长特殊键' };
      if (id === 'buff-cancel') { stopBuff('user'); hint('已停止后续 BUFF 输入；已发送的输入无法撤回。'); return; }
      if (id === 'second' || id === 'third') { emit('skill', id === 'second' ? '二觉技能' : ROLES[role].third, { group: 'awakening', phase: 'tap' }); return; }
      if (names[id]) emit(id, names[id], { phase: 'tap' });
    }
    function moveJoystick(state, event) {
      var rect = state.node.getBoundingClientRect();
      var limit = Math.max(1, rect.width * 0.29);
      var dx = event.clientX - (rect.left + rect.width / 2);
      var dy = event.clientY - (rect.top + rect.height / 2);
      var distance = Math.hypot(dx, dy);
      var scale = distance > limit ? limit / distance : 1;
      var x = dx * scale / limit;
      var y = dy * scale / limit;
      if (distance < rect.width * 0.075) x = y = 0;
      state.node.style.setProperty('--stick-x', (x * limit).toFixed(1) + 'px');
      state.node.style.setProperty('--stick-y', (y * limit).toFixed(1) + 'px');
      var direction = !x && !y ? 'center' : ['right', 'down-right', 'down', 'down-left', 'left', 'up-left', 'up', 'up-right'][(Math.round(Math.atan2(y, x) / (Math.PI / 4)) + 8) % 8];
      if (!state.lastMove || Math.abs(x - state.lastMove.x) + Math.abs(y - state.lastMove.y) > 0.08 || direction !== state.lastMove.direction) {
        state.lastMove = { x: x, y: y, direction: direction };
        emit('move', '方向移动', { active: true, x: x, y: y, direction: direction });
      }
    }
    function onDown(event) {
      if (destroyed || mode === 'click' || event.button !== 0) return;
      var node = event.target.closest('[data-control]');
      if (!node || !root.contains(node)) return;
      event.preventDefault();
      var id = node.dataset.control;
      if (Array.from(pointers.values()).some(function (state) { return state.node === node; })) return;
      if (groups[id] && wheelOwner !== null) { hint('请先完成当前滑选；方向移动仍可同时操作。'); return; }
      var state = { id: event.pointerId, node: node, control: id, startX: event.clientX, startY: event.clientY, started: Date.now(), selected: -1, everSlid: false, kind: groups[id] ? 'group' : (id === 'joystick' ? 'move' : (id === 'attack' ? 'attack' : 'button')) };
      pointers.set(event.pointerId, state);
      node.classList.add('is-pressed');
      try { node.setPointerCapture(event.pointerId); } catch (_) {}
      if (state.kind === 'group') {
        state.group = groups[id];
        state.groupId = id;
        showWheel(state);
        state.holdTimer = win.setTimeout(function () { if (pointers.has(state.id) && !state.everSlid) updateWheel(state); }, 360);
      } else if (state.kind === 'move') moveJoystick(state, event);
      else if (state.kind === 'attack') emit('attack', '普通攻击', { phase: 'down' });
    }
    function onMove(event) {
      var state = pointers.get(event.pointerId);
      if (!state) return;
      event.preventDefault();
      if (state.kind === 'move') { moveJoystick(state, event); return; }
      if (state.kind !== 'group') return;
      var dx = event.clientX - state.startX;
      var dy = event.clientY - state.startY;
      var distance = Math.hypot(dx, dy);
      var width = root.getBoundingClientRect().width;
      var deadzone = Math.max(14, Math.min(23, width * 0.019));
      var outside = Math.max(92, Math.min(170, width * 0.17));
      if (distance > deadzone) state.everSlid = true;
      if (distance <= deadzone || distance > outside) state.selected = -1;
      else {
        var count = state.group.skills.length;
        var angle = Math.atan2(dy, dx) + Math.PI / 2;
        state.selected = (Math.round(angle / (Math.PI * 2 / count)) + count) % count;
      }
      updateWheel(state);
    }
    function onUp(event) {
      var state = pointers.get(event.pointerId);
      if (!state) return;
      event.preventDefault();
      if (state.kind === 'group') onMove(event);
      var selected = state.selected;
      var tap = !state.everSlid && Date.now() - state.started < 360;
      var rect = state.node.getBoundingClientRect();
      var inside = event.clientX >= rect.left && event.clientX <= rect.right && event.clientY >= rect.top && event.clientY <= rect.bottom;
      cancelPointer(state, 'release');
      if (state.kind === 'group') {
        if (tap && state.group.isBuff) { startBuff(); return; }
        if (tap) selected = 0;
        if (selected >= 0) emit('skill', state.group.skills[selected], { group: state.groupId, phase: 'tap', singleSupplement: !!state.group.isBuff, simulated: true });
        else hint('已取消本次选择，没有发送技能输入。');
      } else if (state.kind === 'button' && inside) action(state.control);
    }
    function onCancel(event) {
      var state = pointers.get(event.pointerId);
      if (state) cancelPointer(state, 'pointercancel');
    }
    function onKeyboardClick(event) {
      if (event.detail !== 0 || destroyed) return;
      var node = event.target.closest('[data-control]');
      if (!node || !root.contains(node)) return;
      var id = node.dataset.control;
      if (id === 'joystick') { hint('按住方向摇杆拖动，可同时操作右侧技能。'); return; }
      if (groups[id]) {
        if (groups[id].isBuff) startBuff();
        else emit('skill', groups[id].skills[0], { group: id, phase: 'tap', simulated: true });
      } else if (id === 'attack') {
        emit('attack', '普通攻击', { phase: 'down' });
        emit('attack', '普通攻击', { phase: 'up' });
      } else action(id);
    }
    function onBlur() { cancel('blur'); }
    function onVisibility() { if (doc.hidden) cancel('hidden'); }
    function preventMenu(event) { if (event.target.closest('[data-control]')) event.preventDefault(); }
    function render() {
      root.replaceChildren();
      root.dataset.mode = mode;
      root.dataset.role = role;
      groups = {};
      buffStatus = buffCancelButton = null;
      if (mode === 'click') return;
      var skills = ROLES[role];
      var joystick = button('joystick', '移动', '', 'dnf-joystick');
      joystick.appendChild(element('span', 'dnf-joystick-cross'));
      joystick.appendChild(element('span', 'dnf-joystick-knob'));
      joystick.setAttribute('aria-label', '方向摇杆，按住拖动');
      button('loot', '拾取', '独立操作', 'dnf-utility dnf-pos-loot');
      button('retry', '再挑战', '通关后', 'dnf-utility dnf-pos-retry');
      button('exit', '退出', '离开地下城', 'dnf-utility dnf-pos-exit');
      group('buff', 'BUFF', skills.buff, '短按全放', true);
      if (mode === 'daily') {
        group('main', '主力', skills.daily, '滑选技能');
        group('small', role === 'support' ? '治疗 / 辅助' : '小技能', skills.small.slice(0, 3), '滑选技能');
      } else {
        group('small', '小技能', skills.small, '滑选 4 技能');
        group('big', '大技能', skills.big, '滑选 4 技能');
        group('other', '其他主动', skills.other, '装备 · 誓约 · 一觉');
        button('second', '二觉', '独立释放', 'dnf-awakening dnf-pos-second');
        button('third', role === 'support' ? '辅助三觉' : '三觉', '独立释放', 'dnf-awakening dnf-pos-third');
        button('special', '队长键', '机制操作', 'dnf-utility dnf-pos-special');
      }
      button('attack', '普攻', '按住 / 松开', 'dnf-attack dnf-pos-attack');
      button('jump', '跳跃', '', 'dnf-pos-jump');
      button('potion', '药品', '当前药品', 'dnf-utility dnf-pos-potion');
      buffStatus = element('div', 'dnf-buff-status');
      buffStatus.setAttribute('role', 'status');
      buffStatus.hidden = true;
      root.appendChild(buffStatus);
      buffCancelButton = button('buff-cancel', '停止 BUFF', '取消后续输入', 'dnf-buff-cancel');
      buffCancelButton.hidden = true;
    }
    root.addEventListener('pointerdown', onDown);
    root.addEventListener('pointermove', onMove);
    root.addEventListener('pointerup', onUp);
    root.addEventListener('pointercancel', onCancel);
    root.addEventListener('lostpointercapture', onCancel);
    root.addEventListener('click', onKeyboardClick);
    root.addEventListener('contextmenu', preventMenu);
    win.addEventListener('blur', onBlur);
    doc.addEventListener('visibilitychange', onVisibility);
    render();
    return {
      setMode: function (next) {
        if (destroyed || mode === next) return;
        if (['click', 'daily', 'advanced'].indexOf(next) < 0) throw new RangeError('Unknown control mode.');
        cancel('mode-change'); mode = next; render();
      },
      setRole: function (next) {
        if (destroyed || role === next) return;
        if (!Object.prototype.hasOwnProperty.call(ROLES, next)) throw new RangeError('Unknown role.');
        cancel('role-change'); role = next; render();
      },
      setOpacity: function (value) {
        if (destroyed) return;
        value = Number(value);
        if (!Number.isFinite(value)) return;
        root.style.setProperty('--dnf-control-opacity', String(Math.max(0, Math.min(1, value))));
      },
      cancel: function () { if (!destroyed) cancel('external'); },
      destroy: function () {
        if (destroyed) return;
        cancel('destroy');
        root.removeEventListener('pointerdown', onDown);
        root.removeEventListener('pointermove', onMove);
        root.removeEventListener('pointerup', onUp);
        root.removeEventListener('pointercancel', onCancel);
        root.removeEventListener('lostpointercapture', onCancel);
        root.removeEventListener('click', onKeyboardClick);
        root.removeEventListener('contextmenu', preventMenu);
        win.removeEventListener('blur', onBlur);
        doc.removeEventListener('visibilitychange', onVisibility);
        root.replaceChildren();
        root.classList.remove('dnf-controls');
        root.style.removeProperty('--dnf-control-opacity');
        delete root.dataset.mode;
        delete root.dataset.role;
        destroyed = true;
      }
    };
  }
  global.DNFControls = { create: create };
})(window);
