// ==UserScript==
// @name         cv_special_effects
// @namespace    __zhangyunlong__
// @version      0.1
// @description  初次尝试编写浏览器脚本，为任何网页添加美丽的交互效果
// @author       yunlong
// @include       *
// @grant        none
// ==/UserScript==
(function (_interval_) {
    'use strict';
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
		animationFrame:true,//高频事件触发节流函数状态标志
                array: [],
                line: true, //是否允许连线的状态标志
                move: null, //鼠标焦点粒子
                num: 30, //连线粒子个数	30
                min_speed: 1, //连线粒子速度下区间
                add_speed: 1, //连线粒子速度增加量
                min_radius: 1, //连线粒子半径下区间
                add_radius: 5, //连线粒子半径增加量
                min: 150 //连线粒子之间连线最小距离	150
            }
        };
        function buildCanvas(style) {
            let cv = document.createElement('canvas');
            cv.setAttribute('style', style);
            cv.width = document.documentElement.clientWidth;
            cv.height = document.documentElement.clientHeight;
            document.body.appendChild(cv);
            return cv;
        }
        /* 加入canvas */
        Data.a.cv = buildCanvas('pointer-events:none!important;z-index:89999!important;margin:0!important;padding:0!important;left:0!important;top:0!important;position:fixed!important;display:block;');
        Data.a.ctx = Data.a.cv.getContext('2d');
        Data.b.cv = buildCanvas('pointer-events:none!important;z-index:99999!important;margin:0!important;padding:0!important;left:0!important;top:0!important;position:fixed!important;display:block;');
        Data.b.ctx = Data.b.cv.getContext('2d');
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
        /*    绘图核心方法函数    */
        function _draw_(ctx, x, y, r, _style) {
            ctx.save();
            ctx.beginPath();
            ctx.fillStyle = _style;
            ctx.arc(x, y, r, 0, 2 * Math.PI);
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
        function run() {
            /*
             *	run函数里面来写一移动端桌面端的监听器函数
             *	用来异步处理粒子相关的事件
             */
            window.addEventListener('resize', function () {
                Data.a.cv.width = Data.b.cv.width = document.documentElement.clientWidth;
                Data.a.cv.height = Data.b.cv.height = document.documentElement.clientHeight;
            }, false);
            window.addEventListener('keydown', function (e) {
                e = e || window.event;
                switch (e.keyCode) {
                    //Q键进出烟花模式
                case 81: {
                        if (!Data.a.interval) {
                            auto();
                        } else {
                            cv_clear();
                        }
                        break;
                    }
                    //W键进出连线粒子的绘制
                case 87: {
                        if (!Data.b.interval) {
                            autoB();
                        } else {
                            cvB_clear();
                        }
                        break;
                    }
                default: ;
                }
            }, false);
            window.addEventListener('click', function (e) {
                /* console.info(Data.b.array.length,Data.b.move); */
                e = e || window.event;
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
                //e.preventDefault();
            }, false);
            window.addEventListener('mousemove', function (e) {
		    /*
		     *	该鼠标移动事件监听器回调函数作用域将被高频调用
		     *	需要做函数节流优化性能，使每次回调函数都要在上一次
		     *	执行完之后再执行，这样每一帧画面只会画一次
		     *	一帧画面多次重复画的画面除了浪费资源就没有任何意义了
		     */
		    if(Data.b.animationFrame){
			    Data.b.animationFrame=false;
			    window.requestAnimationFrame(()=>{
				    Data.b.animationFrame=true;
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
})(1000 / 60);
