// ==UserScript==
// @name         funny_box
// @namespace    _zhangyunlong_
// @version      1.0
// @description  新版本更新编码中......2019.7.18
// @author       yunlong
// @include       *
// @grant        none
// ==/UserScript==
;
(function (_interval_) {
    'use strict';
    (function () {
        // 这里做一些初始化操作
        /* localStorage.clear(); */
        if (typeof localStorage['#n@'] === 'undefined') {
            /* 用作夜间模式的暗度值 */
            localStorage['#n@'] = 0;
        }
        if (typeof localStorage['#x@'] === 'undefined') {
            localStorage['#x@'] = document.documentElement.clientWidth - 40;
        } else {
            if (localStorage['#x@'] > document.documentElement.clientWidth) {
                localStorage['#x@'] = document.documentElement.clientWidth - 40;
            }
        }
        if (typeof localStorage['#y@'] === 'undefined') {
            localStorage['#y@'] = document.documentElement.clientHeight / 2;
        } else {
            if (localStorage['#y@'] > document.documentElement.clientHeight) {
                localStorage['#y@'] = document.documentElement.clientHeight / 2;
            }
        }

    })();
    const U = (function () {
        /*    闭包作用域公用数据    */
        let Data = {
            a: { //烟花上升粒子与爆炸粒子相关
                cv: null,
                ctx: null,
                interval: null,
                toTop: null,
                array: [],
                r: 2 //爆炸粒子的半径
            },
            b: { //连线粒子相关
                cv: null,
                ctx: null,
                interval: null,
                animationFrame: true, //高频事件触发节流函数状态标志
                array: [],
                line: true, //是否允许连线的状态标志
                move: null, //鼠标焦点粒子
                num: 30, //连线粒子个数	30
                min_speed: 1, //连线粒子速度下区间
                add_speed: 1, //连线粒子速度增加量
                min_radius: 1, //连线粒子半径下区间
                add_radius: 5, //连线粒子半径增加量
                min: 150 //连线粒子之间连线最小距离	150
            },
            m: {
                clickBox: null, //主按钮
                box: null, //主容器
                animationFrame: true, //高频事件触发节流函数状态标志
                clickBoxCanMove: false, //主按钮移动允许状态位
                array: [],
                string: ['待优化功能', '待优化功能', '待优化功能', '待优化功能', '待优化功能', '待开发功能', '待开发功能', '待开发功能', '待开发功能'],
                game: { // func_0
                    interval: null,
                    cv: null,
                    ctx: null,
                    snake: null,
                    food: null,

                    intervalOfT: null,
                    t_run: null,
                    animationFrame: false
                },
                mode: {
                    cv: null,
                    ctx: null,
                    isMode: false,
                    n: 0 // 暗度值
                }
            },
            animationFrame: true //resize事件触发节流函数状态标志
        };
        /* canvas 构造函数 */
        function buildCanvas() {
            let nObj = arguments[0];
            let cv = document.createElement('canvas');
            cv.setAttribute('style', nObj.style);
            cv.width = nObj.w;
            cv.height = nObj.h;
            document.body.appendChild(cv);
            return cv;
        }
        /* 加入canvas */
        (function () {
            Data.a.cv = buildCanvas({
                    w: document.documentElement.clientWidth,
                    h: document.documentElement.clientHeight,
                    style: `pointer-events:none!important;z-index:99999!important;
					margin:0!important;padding:0!important;
					left:0!important;top:0!important;
					position:fixed!important;display:block!important;`
                });
            Data.a.ctx = Data.a.cv.getContext('2d');
            Data.b.cv = buildCanvas({
                    w: document.documentElement.clientWidth,
                    h: document.documentElement.clientHeight,
                    style: `pointer-events:none!important;z-index:99999!important;
					margin:0!important;padding:0!important;
					left:0!important;top:0!important;
					position:fixed!important;display:block!important;`
                });
            Data.b.ctx = Data.b.cv.getContext('2d');

            Data.m.mode.cv = buildCanvas({
                    w: document.documentElement.clientWidth,
                    h: document.documentElement.clientHeight,
                    style: `pointer-events:none!important;z-index:90000!important;
					margin:0!important;padding:0!important;
					left:0!important;top:0!important;
					position:fixed!important;display:block!important;`
                });
            Data.m.mode.ctx = Data.m.mode.cv.getContext('2d');
            _draw2_(Data.m.mode.ctx, 0, 0, Data.m.mode.cv.width, Data.m.mode.cv.height, `rgba(0,0,0,${localStorage['#n@']})`);

            Data.m.game.cv = buildCanvas({
                    w: 360,
                    h: 360,
                    style: `pointer-events:none!important;z-index:99999!important;
					margin:0!important;padding:0!important;
					left:${document.documentElement.clientWidth/2-180}px!important;
					top:${document.documentElement.clientHeight/2-180}px!important;
					box-shadow:1px 1px 20px #0f0!important;
					position:fixed!important;display:none;background:rgba(0,0,0,0.1);`
                });
            Data.m.game.ctx = Data.m.game.cv.getContext('2d');

        })();
        /*    为内联样式添加transform属性    */
        /* 使用css的translate启用GPU绘图，不使用left,top属性,重绘重排的性能问题 */
        function css() {
            if (arguments.length === 2 || arguments.length >= 3) {
                let thisObj = arguments[0],
                type = arguments[1];
                if (thisObj !== null) {
                    /*thisObj is a html object???*/
                    let textAll = thisObj.getAttribute('style');
                    let hasTransform = /transform/g.test(textAll);
                    if (textAll === null || !hasTransform) {
                        textAll += '-webkit-transform:translateX(0px)translateY(0px)rotate(0deg)!important;';
                        thisObj.setAttribute('style', textAll);
                    }
                    if (arguments.length === 2) {
                        /*读操作*/
                        let array = textAll.match(/translateX\(\-?\d+(\.\d+)?px\)\s*?translateY\(\-?\d+(\.\d+)?px\)\s*?rotate\(\-?\d+(\.\d+)?deg\)/g)[0].match(/\-?\d+(\.\d+)?/g);
                        /*console.log('textAll: '+textAll,'length: '+array.length,'array: '+array);*/
                        switch (type) {
                        case 'X':
                            return Number(array[0]);
                        case 'Y':
                            return Number(array[1]);
                        case 'R':
                            return Number(array[2]);
                        default: ;
                        }
                    } else {
                        /*写操作*/
                        let value = arguments[2];
                        switch (type) {
                        case 'X':
                            textAll = textAll.replace(/X\(\-?\d+(\.\d+)?px\)/, 'X(' + value + 'px)');
                            break;
                        case 'Y':
                            textAll = textAll.replace(/Y\(\-?\d+(\.\d+)?px\)/, 'Y(' + value + 'px)');
                            break;
                        case 'R':
                            textAll = textAll.replace(/rotate\(\-?\d+(\.\d+)?deg\)/, 'rotate(' + value + 'deg)');
                            break;
                        default: ;
                        }
                        /* 所有变化的，未变化的的属性一起设置 */
                        thisObj.setAttribute('style', textAll);
                        /*console.info(thisObj.getAttribute('style'));*/
                    }
                }
            }
        }
        /* div对象构造器 */
        function CreateDiv() {}
        CreateDiv.prototype.set = function () {
            let nObj = arguments[0];
            this.div = document.createElement('div');
            this.div.innerHTML = nObj.html;
            this.div.setAttribute('style',
                `position:fixed!important;left:0px!important;top:0px!important;font-size:
				${nObj.fontS}px!important;margin:0!important;padding:0!important;width:
				${nObj.width}px!important;box-shadow:1px 1px 20px rgba(0,255,255,0.5)!important;color:#f3097f!important;display:
				${nObj.display};height:
				${nObj.height}px!important;background-color:
				${nObj.c}!important;line-height:
				${nObj.lineH}px!important;text-align:center!important;z-index:
				${nObj.zIndex}!important;border-radius:
				${nObj.radius}%!important;-webkit-user-select:none!important;`);
            css(this.div, 'X', nObj.x);
            css(this.div, 'Y', nObj.y);
            nObj.parent.appendChild(this.div);
        }
        /*    初始化结束    */
        function getR() {
            /*
             *    0个数->颜色值
             *    2个数->区间
             */
            let argu = arguments;
            if (argu.length === 0) {
                return Math.round(Math.random() * 256);
            } else if (argu.length === 2) {
                let min = argu[0],
                max = argu[1];
                if (min > max) {
                    [min, max] = [argu[1], argu[0]];
                }
                return Math.round(Math.random() * (max - min) + min);
            } else {
                return null;
            }
        }
        /* 绘圆形核心函数 */
        function _draw_(ctx, x, y, r, _style) {
            ctx.save();
            ctx.beginPath();
            ctx.fillStyle = _style;
            ctx.arc(x, y, r, 0, 2 * Math.PI);
            ctx.fill();
            ctx.restore();
        }
        /*	绘方块核心函数	*/
        function _draw2_(ctx, x, y, w, h, _style) {
            ctx.save();
            ctx.beginPath();
            ctx.fillStyle = _style;
            ctx.rect(x, y, w, h);
            ctx.fill();
            ctx.restore();
        }
        /*    上升，爆炸粒子更新函数    */
        function update() {
            let k = 3 * Data.a.r;
            Data.a.toTop.set({
                x: getR(k, -k + Data.a.cv.width),
                y: -k + Data.a.cv.height,
                r: k,
                c: 'rgba(255,0,0,1)'
            });
            let _r = getR(),
            _g = getR(),
            _b = getR();
            for (let i = 0; i < Data.a.array.length; i++) {
                Data.a.array[i].x = Data.a.toTop.x;
                Data.a.array[i].y = Data.a.toTop.explosionY;
                Data.a.array[i].R = _r;
                Data.a.array[i].G = _g;
                Data.a.array[i].B = _b;
            }
        }
        /*    爆炸粒子构造器    */
        function Explosion({
            x,
            y,
            r,
            R,
            G,
            B,
            A
        }) {
            let obj = arguments[0];
            this.x = obj.x;
            this.y = obj.y;
            this.r = obj.r;
            this.R = obj.R;
            this.G = obj.G;
            this.B = obj.B;
            this.A = obj.A;
            this.v = {};
        }
        /*    上升粒子构造器    */
        function Particles() {}
        Particles.prototype.set = function ({
            x,
            y,
            r,
            c
        }) {
            let obj = arguments[0];
            this.x = obj.x;
            this.y = obj.y;
            this.r = obj.r;
            this.c = obj.c;
            this.explosionY = getR(2 * Data.a.r, Data.a.cv.height / 2);
        };
        Particles.prototype.draw = function (n0, n1, n2, n3) {
            Data.a.ctx.clearRect(n0, n1, n2, n3);
            _draw_(Data.a.ctx, this.x, this.y, this.r, this.c);
        };
        /*	连线粒子构造器	*/
        function ParticlesB({
            x,
            y,
            c,
            radius
        }) {
            let obj = arguments[0];
            this.x = obj.x;
            this.y = obj.y;
            this.c = obj.c;
            this.radius = obj.radius;
            _change_v_(this);
        }
        ParticlesB.prototype.draw = function () {
            _draw_(Data.b.ctx, this.x, this.y, this.radius, this.c);
        };
        /* 改变速度核心函数 */
        function _change_v_(o) {
            let speed = Data.b.min_speed + Data.b.add_speed * Math.random();
            let angle = getR(0, 360) * (Math.PI / 180);
            o.v = {
                x: speed * Math.cos(angle),
                y: speed * Math.sin(angle)
            };
        }
        function getDistance(one, two) {
            return Math.sqrt(Math.pow(one.x - two.x, 2) + Math.pow(one.y - two.y, 2));
        }
        /* 连线粒子循环函数 */
        function loopB() {
            Data.b.interval = window.setInterval(function () {
                    Data.b.ctx.clearRect(0, 0, Data.b.cv.width, Data.b.cv.height);
                    let a = Data.b.array;
                    for (let i = 0; i < a.length; i++) {
                        if (a[i].x > Data.b.cv.width || a[i].x < 0) {
                            a[i].v.x *= -1;
                            if (!Data.b.line) {
                                Data.b.line = true;
                            }
                        }
                        if (a[i].y > Data.b.cv.height || a[i].y < 0) {
                            a[i].v.y *= -1;
                            if (!Data.b.line) {
                                Data.b.line = true;
                            }
                        }
                        a[i].x += a[i].v.x;
                        a[i].y += a[i].v.y;
                        a[i].draw();
                        /* 时间复杂度是O(n^2),因为要遍历每个连线粒子
                        从而确定他们之间连线
                        是否要绘制出来 */
                        for (let j = i + 1; j < a.length; j++) {
                            let distance = getDistance(a[i], a[j]);
                            let a_in_rgba = 1 - distance / Data.b.min;
                            /* 粒子数组连线的透明度，当两个粒子的连线的距离越小于Data.b.min时，连线越亮 */
                            /* console.info(a_in_rgba); */
                            if (Data.b.line && a_in_rgba) {
                                Data.b.ctx.save();
                                Data.b.ctx.lineWidth = 1;
                                Data.b.ctx.strokeStyle = `rgba(${0},${255},${0},${a_in_rgba})`;
                                Data.b.ctx.beginPath();
                                Data.b.ctx.moveTo(a[i].x, a[i].y);
                                Data.b.ctx.lineTo(a[j].x, a[j].y);
                                Data.b.ctx.closePath();
                                Data.b.ctx.stroke();
                                Data.b.ctx.restore();
                            }
                        }
                    }
                }, _interval_);
        }
        /* 上升，爆炸粒子循环函数 */
        function loop() {
            /*
             *    高频调用作用域
             *    粒子上升过程
             *	  此期间做非线性的直线运动
             */
            if (Data.a.toTop.y > Data.a.toTop.explosionY) {
                let k = Math.ceil((Data.a.cv.height - Data.a.toTop.y) / 5);
                //console.info('k '+k);
                Data.a.toTop.y -= k;
                if (Data.a.toTop.y < Data.a.toTop.explosionY) {
                    Data.a.toTop.y = Data.a.toTop.explosionY;
                }
                Data.a.toTop.draw(0, 0, Data.a.cv.width, Data.a.cv.height);
            } else {
                /*    粒子爆炸过程    */
                let k = 2 * Data.a.r;
                let arr = Data.a.array,
                w = -k + Data.a.cv.width,
                h = -k + Data.a.cv.height;
                for (let i = 0; i < arr.length; i++) {
                    if (arr[i].x > k && arr[i].x < w && arr[i].y > k && arr[i].y < h) {
                        arr[i].x += arr[i].v.x;
                        arr[i].y += arr[i].v.y;
                        // 透明度渐变
                        if (arr[i].A >= 0 && arr[i].A <= 1) {
                            arr[i].A -= 0.1;
                            //绘制
                            _draw_(
                                Data.a.ctx,
                                arr[i].x,
                                arr[i].y,
                                Data.a.r,
                                'rgba(' + arr[i].R + ',' + arr[i].G + ',' + arr[i].B + ',' + arr[i].A + ')');
                        } else {
                            arr[i].A = 1;
                        }
                    } else {
                        if (Data.a.interval !== null) {
                            update();
                        }
                    }
                }
            }
        }
        function init() {
            /*    构造爆炸粒子数组    */
            for (let i = 0; i < 36; i++) {
                Data.a.array.push(new Explosion({
                        x: null,
                        y: null,
                        r: Data.a.r,
                        R: null,
                        G: null,
                        B: null,
                        A: 1
                    }));
                let k = i * 10;
                Data.a.array[i].v = {
                    x: Math.cos(k * (Math.PI / 180)),
                    y: Math.sin(k * (Math.PI / 180))
                };
            }
            /*    构造上升粒子    */
            Data.a.toTop = new Particles();
        }
        function auto() {
            init();
            update();
            Data.a.interval = window.setInterval(function () {
                    loop();
                }, _interval_);
        }
        function cv_clear() {
            Data.a.ctx.clearRect(0, 0, Data.a.cv.width, Data.a.cv.height);
            window.clearInterval(Data.a.interval);
            Data.a.interval = null;
            //爆炸粒子数组初始化
            Data.a.array = [];
        }
        function autoB() {
            for (let i = 0; i < Data.b.num; i++) {
                Data.b.array.push(new ParticlesB({
                        x: Math.random() * Data.b.cv.width,
                        y: Math.random() * Data.b.cv.height,
                        c: `rgb(${getR()},${getR()},${getR()})`,
                        radius: Math.round(Data.b.min_radius + Math.random() * Data.b.add_radius)
                    }));
            }
            loopB();
        }
        function cvB_clear() {
            Data.b.ctx.clearRect(0, 0, Data.b.cv.width, Data.b.cv.height);
            window.clearInterval(Data.b.interval);
            Data.b.interval = null;
            /* 连线粒子数组初始化 */
            Data.b.array = [];
            Data.b.move = null;
        }
        function initOfDiv() {
            /* 构建主按钮 */
            Data.m.clickBox = new CreateDiv();
            Data.m.clickBox.set({
                c: 'rgba(20,150,97,0.1)',
                x: localStorage['#x@'] - 40,
                y: localStorage['#y@'] - 40,
                html: '主按钮',
                fontS: 16,
                width: 80,
                display: 'block',
                zIndex: 100000,
                height: 80,
                lineH: 80,
                radius: 50,
                parent: document.body
            });
            /* 构造主容器 */
            Data.m.box = new CreateDiv();
            Data.m.box.set({
                c: '',
                x: localStorage['#x@'] - 540,
                y: localStorage['#y@'] - document.documentElement.clientHeight / 2 - 40,
                html: '',
                fontS: '',
                width: 500,
                display: 'none',
                zIndex: 90000,
                height: document.documentElement.clientHeight / 2,
                lineH: '',
                radius: 0,
                parent: document.body
            });
            let x = 10,
            y = 10;
            let w = (500 - 4 * x) / 3,
            h = (document.documentElement.clientHeight / 2 - 4 * y) / 3;
            let array = [{
                    x: x,
                    y: y
                }, {
                    x: 2 * x + w,
                    y: y
                }, {
                    x: 3 * x + 2 * w,
                    y: y
                }, {
                    x: x,
                    y: 2 * y + h
                }, {
                    x: 2 * x + w,
                    y: 2 * y + h
                }, {
                    x: 3 * x + 2 * w,
                    y: 2 * y + h
                }, {
                    x: x,
                    y: 3 * y + 2 * h
                }, {
                    x: 2 * x + w,
                    y: 3 * y + 2 * h
                }, {
                    x: 3 * x + 2 * w,
                    y: 3 * y + 2 * h
                }
            ];
            /* 构建功能按钮 */
            for (let i = 0; i < 9; i++) {
                let obj = new CreateDiv();
                obj.set({
                    c: 'rgba(210,230,0,0.5)',
                    x: array[i].x,
                    y: array[i].y,
                    html: Data.m.string[i] + i,
                    fontS: 16,
                    width: w,
                    display: 'block',
                    zIndex: 90000,
                    height: h,
                    lineH: h,
                    radius: 10,
                    parent: Data.m.box.div
                });
                Data.m.array.push(obj);
            }
        }
        /*    方块构造器    */
        function Rect({
            x,
            y,
            w,
            h,
            c
        }) {
            let obj = arguments[0];
            this.x = obj.x;
            this.y = obj.y;
            this.w = obj.w;
            this.h = obj.h;
            this.c = obj.c;
        }
        Rect.prototype.draw = function () {
            _draw2_(Data.m.game.ctx, this.x, this.y, this.w, this.h, this.c);
        };
        /*    蛇构造器    */
        function Snake() {
            this.array = [];
            /*
             *    数组的splice(add_index,delete_num,new_add_1,new_add_2,...)
             *    方法,这里是从下标为0的地方新加入数组元素
             *    与push方法往后加不同,这里是往前加,打算让
             *    第一个加的作为蛇头,其坐标与数组下标正向
             *    逻辑关联,这里就是x坐标最大(3*18,0)
             *
             */
            for (let i = 3; i >= 0; i--) {
                let rect = new Rect({
                        x: i * 18,
                        y: 0,
                        w: 18,
                        h: 18,
                        c: 'yellow'
                    });
                this.array.splice(0, 0, rect);
            }
            /*    设置蛇头    */
            this.snakeHead = this.array[3];
            this.snakeHead.c = '#0f0';
            /*    设置方向    */
            this.directionWord = 'to-right';
        }
        Snake.prototype.draw = function () {
            for (let i = 0; i < this.array.length; i++) {
                this.array[i].draw();
            }
        };
        /*    蛇类的移动方法    */
        Snake.prototype.move = function () {
            let cv = Data.m.game.cv,
            interval = Data.m.game.interval;

            /*    构造一个新的方块,它的位置就是蛇头地位置    */
            let newAddRect = new Rect({
                    x: this.snakeHead.x,
                    y: this.snakeHead.y,
                    w: this.snakeHead.w,
                    h: this.snakeHead.h,
                    c: 'yellow'
                });
            /*    splice方法数组下标往前加,总是加在蛇头之前的那个下标    */
            this.array.splice(-1 + this.array.length, 0, newAddRect);
            /*    判断是否吃到食物,若吃到,则更新食物的位置;否则移动,把数组下标为0的删除    */
            if (eat()) {
                Data.m.game.food = Food();
            } else {
                this.array.splice(0, 1);
            }
            /*    根据directionWord更新蛇头的位置    */
            switch (this.directionWord) {
            case 'to-left': {
                    this.snakeHead.x -= this.snakeHead.w;
                    break;
                }
            case 'to-up': {
                    this.snakeHead.y -= this.snakeHead.h;
                    break;
                }
            case 'to-right': {
                    this.snakeHead.x += this.snakeHead.w;
                    break;
                }
            case 'to-down': {
                    this.snakeHead.y += this.snakeHead.h;
                    break;
                }
            default: ;
            }
            /*    碰墙检测    */
            if (this.snakeHead.x >= cv.width || this.snakeHead.x < 0 || this.snakeHead.y >= cv.height || this.snakeHead.y < 0) {
                window.clearInterval(interval);
                interval = null;
                window.alert('你碰到墙了!');
            }
            /*
             *    碰自身检测,对除蛇头外的每一个身体方块对象
             *    遍历,如果坐标与蛇头位置坐标相同,就是撞到了
             *    进行相关处理
             */
            for (let i = 0; i < -1 + this.array.length; i++) {
                if (this.array[i].x === this.snakeHead.x && this.array[i].y === this.snakeHead.y) {
                    window.clearInterval(interval);
                    interval = null;
                    window.alert('你碰到自己了!');
                }
            }
        };
        /*    判断蛇头是否与食物坐标重合,返回true或false    */
        function eat() {
            return Data.m.game.snake.snakeHead.x === Data.m.game.food.x && Data.m.game.snake.snakeHead.y === Data.m.game.food.y ? true : false;
        }
        /*    食物构造器    */
        function Food() {
            let onSnake = true,
            cv = Data.m.game.cv,
            rect;
            /*    onSnake表示食物坐标与某个蛇身体坐标重合    */
            while (onSnake) {
                onSnake = false;
                let rX = getR(0, -1 + cv.width / 18);
                let rY = getR(0, -1 + cv.height / 18);
                let s = Data.m.game.snake;
                /* console.info(rX, rY); */
                rect = new Rect({
                        x: rX * 18,
                        y: rY * 18,
                        w: 18,
                        h: 18,
                        c: '#a89183'
                    });
                // console.info(rect.x, rect.y);
                /*
                 *    这里对每个蛇身遍历,如果它的坐标与新生成
                 *    随机地址的食物坐标相同,则再次循环往复重
                 *    新生成新地址
                 */
                for (let i = 0; i < s.array.length; i++) {
                    if (s.array[i].x === rect.x && s.array[i].y === rect.y) {
                        onSnake = true;
                        break;
                    }
                }
            }
            return rect;
        }

        //	snake 事件监听回调函数
        function keydown_callback_snake(e) {
            e = e || window.event;

            switch (e.keyCode) {
            case 65: { //A
                    if (Data.m.game.snake.directionWord !== 'to-right') {
                        Data.m.game.snake.directionWord = 'to-left';
                    }
                    break;
                }
            case 68: { //D
                    if (Data.m.game.snake.directionWord !== 'to-left') {
                        Data.m.game.snake.directionWord = 'to-right';
                    }
                    break;
                }
            case 83: { //S
                    if (Data.m.game.snake.directionWord !== 'to-up') {
                        Data.m.game.snake.directionWord = 'to-down';
                    }
                    break;
                }
            case 87: { //W
                    if (Data.m.game.snake.directionWord !== 'to-down') {
                        Data.m.game.snake.directionWord = 'to-up';
                    }
                    break;
                }
            default: ;
            }
        }

        function add_eventListener_snake() {
            window.addEventListener('keydown', keydown_callback_snake, false);
        }

        function remove_eventListener_snake() {
            /* console.info('snake-remove'); */
            window.removeEventListener('keydown', keydown_callback_snake, false);
        }

        function func_0() { // 贪吃蛇游戏
            if (Data.m.game.interval === null && Data.m.game.intervalOfT === null) {
                Data.m.box.div.style.display = 'none';
                /*    构造蛇对象实例    */
                Data.m.game.snake = new Snake();
                Data.m.game.snake.draw();
                /*    构造食物对象实例    */
                Data.m.game.food = Food();
                let cv = Data.m.game.cv,
                ctx = Data.m.game.ctx;
                cv.style.display = 'block';
                /* 添加监听事件 */
                add_eventListener_snake();
                /*设置定时器*/
                Data.m.game.interval = window.setInterval(function () {
                        ctx.clearRect(0, 0, cv.width, cv.height);
                        Data.m.game.food.draw();
                        Data.m.game.snake.move();
                        Data.m.game.snake.draw();
                        /*    不断更新    */
                    }, 300);

            } else if (Data.m.game.interval !== null && Data.m.game.intervalOfT === null) {
                window.clearInterval(Data.m.game.interval);
                Data.m.game.interval = null;
                /* 移除监听事件 */
                remove_eventListener_snake();
                Data.m.game.cv.style.display = 'none';
                Data.m.game.ctx.clearRect(0, 0, Data.m.game.cv.width, Data.m.game.cv.height);
                Data.m.game.snake = null;
                Data.m.game.food = null;
            }
        }
        /* 更新localStorage */
        function update_local_n() {
            Data.m.mode.n += 0.1;
            localStorage['#n@'] = Data.m.mode.n;
            Data.m.mode.ctx.clearRect(0, 0, Data.m.mode.cv.width, Data.m.mode.cv.height);
            _draw2_(Data.m.mode.ctx, 0, 0, Data.m.mode.cv.width, Data.m.mode.cv.height, `rgba(0,0,0,${Data.m.mode.n})`);
        }

        function func_1() { // 引入本地缓存的夜间模式
            if (!Data.m.mode.isMode) {
                Data.m.mode.isMode = true;
                update_local_n();
            } else {
                /* 暗度值最小是0.1，最大是0.8 */
                if (Data.m.mode.n < 0.8) {
                    update_local_n();
                    if (Data.m.mode.n >= 0.8) {
                        Data.m.mode.n = 0;
                        localStorage['#n@'] = Data.m.mode.n;
                        Data.m.mode.ctx.clearRect(0, 0, Data.m.mode.cv.width, Data.m.mode.cv.height);
                        Data.m.mode.isMode = false;
                    }
                }
            }
            /* console.info(Data.m.mode.n); */
        }
        /* 关键词高亮搜索 */
        function makeKeyWordLight(tag, keyWord) {
            let tags = document.getElementsByTagName(tag),
            reg_exp = new RegExp(keyWord, 'gi'),
            replace_key = `<span style='background:#fcbb00;'>${keyWord}</span>`;
            /* console.info('tags.length: ' + tags.length); */
            /* 对每一种标签的每一个进行进行替换 */
            for (let i = 0; i < tags.length; i++) {
                let inner = tags[i].innerHTML;
                /* console.info('nodeName: '+tags[i].nodeName); */
                /* console.info(inner, typeof inner); */
                /* 在Chrome中，innerHTML仅仅是内容（只包含文本结点，不包含标签节点，属性结点），后续更新兼容其他浏览器 */
                let isDo = inner.match(reg_exp);
                /* 匹配的关键词不为空时 */
                /* console.info(isDo); */
                if (isDo !== null) {
                    inner = inner.replace(reg_exp, replace_key); // 样式替换
                    /* console.info(1, inner); */
                    tags[i].innerHTML = inner;
                }
            }
        }

        function func_2() {
            let keyWord = window.prompt('请输入要查找的关键字');
            /* 可以有文字的html标签 */
            let array = [
                'p', 'a', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'
            ];
            /* console.info('keyWord: ',keyWord === '',typeof keyWord,!keyWord); */
            if (keyWord !== '' || keyWord) {
                for (let i = 0; i < array.length; i++) {
                    /* 两层嵌套循环，时间复杂度O(array.length*tags.length) */
                    makeKeyWordLight(array[i], keyWord);
                }
            }
        }

        /* 俄罗斯方块运行逻辑对象构造函数 */
        function TetrisRun() {
            /* 当前方块的距离左上角横纵坐标位移量初始化 */
            this.xx = 10;
            this.yy = 0;
        }
        /* 来往俄罗斯方块运行逻辑对象构造器原型上面加一些共享的方法 */
        TetrisRun.prototype.now_rect_init = function (n) {
            //7大类共19种,初始化方块数组
            switch (n) {
            case 0:
                this.now_rect = [
                    [1, 1], //1.0  0
                    [1, 1]
                ];
                break;
            case 1:
                this.now_rect = [
                    [1, 1, 1, 1]//2.0  1
                ];
                break;
            case 2:
                this.now_rect = [
                    [1],
                    [1], //2.1  2
                    [1],
                    [1]
                ];
                break;
            case 3:
                this.now_rect = [
                    [1, 0], //3.0  3
                    [1, 1],
                    [0, 1]
                ];
                break;
            case 4:
                this.now_rect = [
                    [0, 1, 1], //3.1  4
                    [1, 1, 0]
                ];
                break;
            case 5:
                this.now_rect = [
                    [0, 1], //4.0  5
                    [1, 1],
                    [1, 0]
                ];
                break;
            case 6:
                this.now_rect = [
                    [1, 1, 0], //4.1  6
                    [0, 1, 1]
                ];
                break;
            case 7:
                this.now_rect = [
                    [0, 1], //5.0  7
                    [1, 1],
                    [0, 1]
                ];
                break;
            case 8:
                this.now_rect = [
                    [1, 1, 1], //5.1  8
                    [0, 1, 0]
                ];
                break;
            case 9:
                this.now_rect = [
                    [1, 0],
                    [1, 1], //5.2  9
                    [1, 0]
                ];
                break;
            case 10:
                this.now_rect = [
                    [0, 1, 0], //5.3  10
                    [1, 1, 1]
                ];
                break;
            case 11:
                this.now_rect = [
                    [0, 1], //6.0  11
                    [0, 1],
                    [1, 1]
                ];
                break;
            case 12:
                this.now_rect = [
                    [1, 1, 1], //6.1  12
                    [0, 0, 1]
                ];
                break;
            case 13:
                this.now_rect = [
                    [1, 1], //6.2  13
                    [1, 0],
                    [1, 0]
                ];
                break;
            case 14:
                this.now_rect = [
                    [1, 0, 0], //6.3  14
                    [1, 1, 1]
                ];
                break;
            case 15:
                this.now_rect = [
                    [1, 0], //7.0  15
                    [1, 0],
                    [1, 1]
                ];
                break;
            case 16:
                this.now_rect = [
                    [0, 0, 1], //7.1  16
                    [1, 1, 1]
                ];
                break;
            case 17:
                this.now_rect = [
                    [1, 1], //7.2  17
                    [0, 1],
                    [0, 1]
                ];
                break;
            case 18:
                this.now_rect = [
                    [1, 1, 1], //7.3  18
                    [1, 0, 0]
                ];
                break;
            }
        }
        /* 初始化地图数组,一个20行20列的全0矩阵 */
        TetrisRun.prototype.map_init = function () {
            this.map = [];
            for (let i = 0; i < 20; i++) {
                this.map.push([]);
                for (let j = 0; j < 20; j++) {
                    this.map[i].push(0);
                }
            }
        }
        /* now_rect 数组位置信息写入map数组 */
        TetrisRun.prototype.now_rect_message_to_map = function () {
            let y = this.now_rect.length;
            let x = this.now_rect[0].length;
            for (let i = 0; i < y; i++) {
                for (let j = 0; j < x; j++) {
                    if (!this.map[i + this.yy][j + this.xx]) {
                        /* 只有位置映射到地图数组（包含横纵坐标变换）值为0时才进行赋值操作，否则不可以 */
                        this.map[i + this.yy][j + this.xx] = this.now_rect[i][j];
                    }
                }
            }
        }
        /* 高频调用作用域 */
        TetrisRun.prototype.draw_map = function () {
            /* 该作用域被循环调用，每次调用前先清除画布 */
            let W = Data.m.game.cv.width,
            H = Data.m.game.cv.height,
            ctx = Data.m.game.ctx;
            ctx.clearRect(0, 0, W, H);
            //也可以不写这句，后面画的覆盖掉以前的，我处于强迫症，还是先清除再画，如果不清除的话，会有一些”尾巴“阴影效果
            let w = (W - (20 + 1) * 5) / 20,
            h = (H - (20 + 1) * 5) / 20; //分成20份，每份之间间隔5px,这是每一份的宽高
            let y = this.map.length, //20
            x = this.map[0].length; //20
            /* 获取方块数组的行列数 */
            for (let i = 0; i < y; i++) {
                for (let j = 0; j < x; j++) {
                    ctx.fillStyle = this.map[i][j] === 0 ? 'rgba(0,0,0,0.9)' : '#0f0'; //经过地方是绿色
                    ctx.fillRect((j + 1) * 5 + j * w, (i + 1) * 5 + i * w, w, h);
                }
            }
        }
        TetrisRun.prototype.clearBefore = function () {
            let y = this.now_rect.length; //方块数组的行列数
            let x = this.now_rect[0].length;
            for (let i = 0; i < y; i++) {
                for (let j = 0; j < x; j++) {
                    if (this.now_rect[i][j]) { // 1
                        //清除地图数组中上一个位置信息
                        this.map[i + this.yy][j + this.xx] = 0;
                    }
                }
            }
        }
        TetrisRun.prototype.remove_line_if_all_1 = function () {
            let y = this.map.length; //20
            let x = this.map[0].length; //20
            let n = null;
            for (let i = 0; i < y; i++) {
                n = true;
                for (let j = 0; j < x; j++) {
                    if (!this.map[i][j]) { //0
                        n = false;
                    }
                }
                if (n) {
                    /* 当n为true时，说明这一行数组全为1 */
                    /* 当地图数组每一行都是1时，就把这一行删掉,这是地图有一行是被填满的 */
                    this.map.splice(i, 1);
                    /* 在this.map开头加上[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]，即为this.map[0] */
                    this.map.splice(0, 0, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
                }
            }
        }
        //检测下方碰撞
        TetrisRun.prototype.border_bottom_or_other_rect = function () {
            /*
             *	算法思想是这样的：
             *	先判断now_rect方块距离画板上方的距离yy与自身的高度now_rect.length之和是否不小于map.length
             *	如果结果是真，则已经到达地图底部，返回true；
             *	上述过程返回结果是false，则说面未到达地图底部，则继续进行是否碰撞到其它方块的判断:
             *	先拿到now_rect二位数组的最后一个元素，这是一维数组a，然后对a的每一个元素循环进行判断:
             *	它是否非1，是则在now_rect二维数组中对应位置的正上方的位置继续判断是否为非1，如此做while循环
             *	直至找到now_rect[][]值是1的位置，接着判断对应位置向下位置的map[][]中值是否为1，如果是1，则说明
             *	碰撞到其它方块了，返回true，如果是非1，则继续对a的下一个值进行以上过程。
             *	后续优化一下算法，目前时间复杂度是O(n^2).
             *																	--------2019.7.18
             *
             */
            let len = this.now_rect.length;
            if (this.yy + len >= this.map.length) {
                return true;
            }
            let a = this.now_rect[len - 1];
            //从下往上
            for (let i = 0; i < a.length; i++) {
                let n = len - 1;
                while (!this.now_rect[n][i]) { //0
                    n--;
                }
                //对应map[][]位置的向下一个位置
                if (this.map[this.yy + 1 + n][this.xx + i]) { //1
                    return true;
                }
            }
            return false;
        }
        //检测左右碰撞
        TetrisRun.prototype.border_X_or_other_rect = function (n) {
            //-1向左，1向右
            let maxX = this.map[0].length - this.now_rect[0].length;
            //左右移动碰撞到了边缘
            if (this.xx + n < 0 || this.xx + n > maxX) {
                return true;
            }
            //对是否碰撞到其它方块检测
            let y = this.now_rect.length;
            if (n === -1) {
                //从左往右,只检测值为1的now_rect数组元素
                for (let i = 0; i < y; i++) {
                    let j = 0;
                    while (!this.now_rect[i][j]) { //0
                        j++;
                    }
                    //对应map[][]位置想向左一个位置
                    if (this.map[i + this.yy][this.xx - 1 + j]) {
                        return true;
                    }
                }
            } else if (n === 1) {
                //从右往左,只检测值为1的now_rect数组元素
                for (let i = 0; i < y; i++) {

                    let j = this.now_rect[0].length - 1;
                    while (!this.now_rect[i][j]) { //0
                        j--;
                    }
                    /* 这里类似触底碰撞检测 */
                    //对应map[][]位置向右一个位置
                    if (this.map[i + this.yy][this.xx + 1 + j]) { //1
                        return true;
                    }
                }
            }
            return false;
        }
        //方块旋转
        TetrisRun.prototype.rotate = function () { //顺时针
            let a = [];
            let x = this.now_rect[0].length; //列长度
            let y = this.now_rect.length; //行长度
            /* console.info(x, y); */
            for (let i = 0; i < x; i++) {
                a.push([]);
            }
            /* 简单的矩阵装置算法 */
            for (let i = 0; i < y; i++) {
                for (let j = 0; j < x; j++) {
                    a[j][y - i - 1] = this.now_rect[i][j];
                }
            }
            /* 在左右底部边界以及碰撞到别的方块时候就不能转置 */
            if (this.border_bottom_or_other_rect() || this.border_X_or_other_rect(1) || this.border_X_or_other_rect(-1)) {
                return;
            }
            this.now_rect = a;
        }
        /* 游戏运行的核心原型方法，高频调用作用域 */
        TetrisRun.prototype.loop = function (interval) {
            let _this = this;
            /* 获取函数执行上下文this */
            Data.m.game.intervalOfT = window.setInterval(function () {
                    /* 匿名函数里的上下文对象this需要重新绑定 */
                    if (_this.border_bottom_or_other_rect()) {
                        _this.remove_line_if_all_1();
                        //重新赋初值
                        _this.yy = 0;
                        _this.xx = 10;
                        _this.now_rect_init(getR(0, 18));
                    }
                    //清除每一个小方格上一个位置的数据
                    _this.clearBefore();
                    _this.yy++;
                    _this.now_rect_message_to_map();
                    _this.draw_map();
                }, interval);
        }
        //监听器回调函数,这最好不要是TetrisRun的原型函数
        function keydown_callback_tetris(e) {
            e = e || window.event;
            let t_run = Data.m.game.t_run;

            /* console.info(t_run.xx, t_run.yy); */

            switch (e.keyCode) {
            case 65: //A
                t_run.clearBefore();
                if (!t_run.border_X_or_other_rect(-1)) {
                    t_run.xx--;
                }
                t_run.now_rect_message_to_map();
                break;
            case 68: //D
                t_run.clearBefore();
                if (!t_run.border_X_or_other_rect(1)) {
                    t_run.xx++;
                }
                t_run.now_rect_message_to_map();
                break;
            case 87: //W
                t_run.clearBefore();
                t_run.rotate();
                t_run.now_rect_message_to_map();
                break;
            case 83:
                if (Data.m.game.animationFrame) {
                    return; //事件节流操作，高频事件,当keyup执行后才能继续执行下面的内容
                }
                Data.m.game.animationFrame = true;
                window.clearInterval(Data.m.game.intervalOfT);
                t_run.loop(50);
                break;
            default: ;
            }
        }

        function keyup_callback_tetris(e) {
            e = e || window.event;
            if (e.keyCode === 83) { // S
                Data.m.game.animationFrame = false;
                window.clearInterval(Data.m.game.intervalOfT);
                Data.m.game.t_run.loop(500);
            }
        }
        function add_eventListener_tetris() {
            window.addEventListener('keydown', keydown_callback_tetris, false);
            window.addEventListener('keyup', keyup_callback_tetris, false);
        }
        function remove_eventListener_tetris() {
            /* console.info('tetris-remove'); */
            window.removeEventListener('keydown', keydown_callback_tetris, false);
            window.removeEventListener('keyup', keyup_callback_tetris, false);
        }

        function func_3() {
            /* 转换一下思路，总是来画背景，map数组在每一次循环里都被更新 */
            if (Data.m.game.intervalOfT === null && Data.m.game.interval === null) {
                Data.m.box.div.style.display = 'none';
                Data.m.game.cv.style.background = 'rgba(0,0,0,0.9)';
                Data.m.game.cv.style.display = 'block';
                Data.m.game.t_run = new TetrisRun();
                let t_run = Data.m.game.t_run;
                t_run.now_rect_init(getR(0, 18));
                t_run.map_init();
                t_run.now_rect_message_to_map();
                t_run.draw_map();
                /* 添加监听事件 */
                add_eventListener_tetris();
                t_run.loop(500);
            } else if (Data.m.game.intervalOfT !== null && Data.m.game.interval === null) {
                window.clearInterval(Data.m.game.intervalOfT);
                Data.m.game.intervalOfT = null;
                /* 移除监听事件 */
                remove_eventListener_tetris();
                /* 监听事件在游戏结束需要清除掉，否则会造成冲突情况 */
                Data.m.game.cv.style.display = 'none';
                Data.m.game.cv.style.background = 'rgba(0,0,0,0.1)';
                Data.m.game.ctx.clearRect(0, 0, Data.m.game.cv.width, Data.m.game.cv.height);
                /* 重置游戏运行对象 */
                Data.m.game.t_run = null;
            }
        }

        function func_4() {}

        function func_5() {}

        function func_6() {}

        function func_7() {}

        function func_8() {}

        function run() {
            initOfDiv();
            let three = {
                passive: true
            }
             || false;
            /*
             *	run函数里面来写一写桌面端（后续加入移动端事件）的监听器函数
             *	用来异步处理粒子相关的事件
             */
            window.addEventListener('resize', function () {
                /* 高频事件，使用事件节流技术优化性能 */
                if (Data.animationFrame) {
                    Data.animationFrame = false;
                    window.requestAnimationFrame(() => {
                        Data.a.cv.width = Data.b.cv.width = document.documentElement.clientWidth;
                        Data.a.cv.height = Data.b.cv.height = document.documentElement.clientHeight;
                        Data.animationFrame = true;
                    });
                }
            }, false);

            window.addEventListener('keydown', function (e) {
                e = e || window.event;
                /* 无限制全局监听 */
                switch (e.keyCode) {
                    //O键进出烟花模式
                case 79: {
                        if (!Data.a.interval) {
                            auto();
                        } else {
                            cv_clear();
                        }
                        break;
                    }
                    //P键进出连线粒子的绘制
                case 80: {
                        if (!Data.b.interval) {
                            autoB();
                        } else {
                            cvB_clear();
                        }
                        break;
                    }
                default: ;
                }
                //其他部分的监听在结束会自动移除
            }, false);

            /* 鼠标滑轮事件，Chrome浏览器中的被动（passive）监听器 */
            window.addEventListener('wheel', function (e) {
                e = e || window.event;
                switch (e.target) {
                case Data.m.clickBox.div: {
                        Data.m.box.div.style.display = Data.m.box.div.style.display === 'block' ? 'none' : 'block';
                        break;
                    }
                default: ;
                }
                /* 这里后续改进，与滚动滑轮dom文档上下移动有点冲突 */
            }, three);

            /* onmouseover,onmouseout支持事件冒泡，可以用事件委托来优化性能；
            onmouseenter,onmouseleave不支持事件冒泡 */
            /* window.addEventListener('mouseover', function (e) {


            }, false);

            window.addEventListener('contextmenu', function (e) {
            console.info(e);
            }, false);

            window.addEventListener('mouseout', function (e) {
            e = e || window.event;

            }, false);

            window.addEventListener('mousedown', function (e) {
            e = e || window.event;

            }, false); */

            window.addEventListener('mouseup', function (e) {
                /* console.info(Data.b.array.length,Data.b.move); */
                e = e || window.event;
                /* 全局监听，不受限制 */
                if (Data.b.interval !== null) {
                    if (Data.b.line) {
                        Data.b.line = false;
                    }
                    let a = Data.b.array;
                    /* 遍历改变每一个粒子的xy坐标以及速度 */
                    for (let i = 0; i < a.length; i++) {
                        a[i].x = e.clientX;
                        a[i].y = e.clientY;
                        _change_v_(a[i]);
                    }
                }
                switch (e.target) {
                case Data.m.array[0].div: {
                        func_0();
                        break;
                    }
                case Data.m.array[1].div: {
                        func_1();
                        break;
                    }
                case Data.m.array[2].div: {
                        func_2();
                        break;
                    }
                case Data.m.array[3].div: {
                        func_3();
                        break;
                    }
                case Data.m.array[4].div: {
                        func_4();
                        break;
                    }
                case Data.m.array[5].div: {
                        func_5();
                        break;
                    }
                case Data.m.array[6].div: {
                        func_6();
                        break;
                    }
                case Data.m.array[7].div: {
                        func_7();
                        break;
                    }
                case Data.m.array[8].div: {
                        func_8();
                        break;
                    }
                default: ;
                }

                //e.preventDefault();
            }, false);

            window.addEventListener('dblclick', function (e) {
                e = e || window.event;

                if (e.target === Data.m.clickBox.div) {
                    Data.m.clickBoxCanMove = Data.m.clickBoxCanMove ? false : true;
                }

            }, false);

            window.addEventListener('mousemove', function (e) {
                /*
                 *	该鼠标移动事件监听器回调函数作用域将被高频调用
                 *	需要做函数节流优化性能，使每次回调函数都要在上一次
                 *	执行完之后再执行，这样每一帧画面只会画一次
                 *	一帧画面多次重复画的画面除了浪费资源就没有任何意义了
                 */
                /* 对鼠标焦点连线粒子 */
                if (Data.b.interval !== null) {
                    e = e || window.event;
                    if (Data.b.animationFrame) {
                        Data.b.animationFrame = false;
                        window.requestAnimationFrame(() => {
                            if (Data.b.interval) {
                                if (!Data.b.move) {
                                    /* console.info(Data.b.move); */
                                    /* 此时创建移动焦点小球 */
                                    Data.b.move = new ParticlesB({
                                            x: e.clientX,
                                            y: e.clientY,
                                            c: 'rgba(0,255,0,0.8)',
                                            radius: 12
                                        });
                                    Data.b.array.push(Data.b.move);
                                } else {
                                    /* 改变焦点粒子的xy坐标以及速度 */
                                    Data.b.move.x = e.clientX;
                                    Data.b.move.y = e.clientY;
                                    _change_v_(Data.b.move);

                                }
                            }
                            Data.b.animationFrame = true;
                        });
                    }
                }
                /* 对主按钮 */
                if (Data.m.clickBoxCanMove && Data.m.animationFrame) {
                    e = e || window.event;
                    Data.m.animationFrame = false;
                    let div = Data.m.clickBox.div;
                    /* 这里同样是要做事件节流，做性能优化 */
                    window.requestAnimationFrame(() => {

                        let x = e.clientX - 40,
                        y = e.clientY - 40,
                        xx = x - 500,
                        yy = y - document.documentElement.clientHeight / 2;

                        div.style.boxShadow = `1px 1px 20px rgba(${getR()},${getR()},${getR()},0.4)`;

                        if (x !== localStorage['#x@']) {

                            css(div, 'X', x);
                            css(Data.m.box.div, 'X', xx);

                            localStorage['#x@'] = x;
                            /* 存储中心点的坐标 */
                            if (!Data.m.animationFrame) {
                                Data.m.animationFrame = true;
                            }
                        }
                        if (y !== localStorage['#y@']) {

                            css(div, 'Y', y);
                            css(Data.m.box.div, 'Y', yy);

                            localStorage['#y@'] = y;
                            if (!Data.m.animationFrame) {
                                Data.m.animationFrame = true;
                            }
                        }

                    });
                }
            }, false);

            /* onclick contouchend事件，移动端先触发后者，再触发前者 */
            /* 因为主要是编写桌面端的脚本，移动端就随便写一点事件监听器了 */
            window.addEventListener('touchend', function (e) {
                e = e || window.event;
                //console.info(e.changedTouches[0]);
                let x = e.changedTouches[0].clientX;
                let y = e.changedTouches[0].clientY;
                /*
                点击屏幕上半部分（竖屏的1/20，横屏在1/3到2/3之间），开启烟花模式，并且绘制连线粒子
                点击屏幕下半部分（竖屏是1/20，横屏在1/3到2/3之间），退出烟花模式，也不再绘制连线粒子
                 */
                if (y < Data.a.cv.height / 20 && x > Data.a.cv.width / 3 && x < Data.a.cv.width * 2 / 3) {
                    if (Data.a.interval === null) {
                        auto();
                    }
                    if (Data.b.interval === null) {
                        autoB();
                    }
                }
                if (y > Data.a.cv.height * 19 / 20 && x > Data.a.cv.width / 3 && x < Data.a.cv.width * 2 / 3) {
                    if (Data.a.interval) {
                        cv_clear();
                    }
                    if (Data.b.interval) {
                        cvB_clear();
                    }
                }
            }, false);
        }
        /*    闭包作用域返回对外界作用域的接口    */
        return {
            run: run
        };

    })();

    U.run();

    /* console.info(window.localStorage);
     */
})(1000 / 60);
