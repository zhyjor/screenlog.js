(function () {
	
	var logEl,
		isInitialized = false,
		_console = {}; // backup console obj to contain references of overridden fns.
		_options = {
			bgColor: 'black',
			logColor: 'lightgreen',
			infoColor: 'blue',
			warnColor: 'orange',
			errorColor: 'red',
			freeConsole: false,
			css: '',
			autoScroll: true,
            touch_ball: true
		};
	
	function createElement(tag, css) {
		var element = document.createElement(tag);
		element.style.cssText = css;
		return element;
	}
	
	function createPanel() {
		var div = createElement('div', 'z-index:100000;font-family:Helvetica,Arial,sans-serif;font-size:10px;font-weight:bold;padding:5px;text-align:left;opacity:0.8;position:fixed;right:0;top:0;min-width:200px;max-height:50vh;overflow:auto;background:' + _options.bgColor + ';' + _options.css);
		div.id = 'logger';
		return div;
	}
	
	function genericLogger(color) {
		return function() {
			var el = createElement('div', 'line-height:18px;min-height:18px;background:' +
				(logEl.children.length % 2 ? 'rgba(255,255,255,0.1)' : '') + ';color:' + color); // zebra lines
			var val = [].slice.call(arguments).reduce(function(prev, arg) {
				return prev + ' ' + (typeof arg === "object" ? JSON.stringify(arg) : arg);
			}, '');
			el.textContent = val;
			
			logEl.appendChild(el);
			
			// Scroll to last element, if autoScroll option is set.
			if(_options.autoScroll) {
				logEl.scrollTop = logEl.scrollHeight - logEl.clientHeight;
			}
		};
	}

	function showLogger() {
        var div1=document.getElementById("logger");
        div1.style.visibility='visible';
    }

    function hiddenLogger() {
        var div1=document.getElementById("logger");
        div1.style.visibility='hidden';
    }

    function isShow(flag) {
		if(flag){
            showLogger();
		}else {
            hiddenLogger();
		}
    }

    function initTouchBall(callback) {
        var touch_ball = '<div class="barrage" id="barrage" style="position:fixed;display:block;z-index: 100001;top:0;">'
            +'<div class="barrage_name" id="barrage_name" style="width:100px;height:100px;background:#00aeff;border-radius:50%;">'
            +'<span class="col1" style="color:#fff;display: block;padding: 17px;font-size: 25px;line-height: 35px;text-align: center;">关闭调试</span>'
            +'</div>'
            +'</div>';
        var body=$("body");
        body.append(touch_ball);

        var cont=$("#barrage");
        var contW=$("#barrage").width();
        var contH=$("#barrage").height();
        var startX,startY,sX,sY,moveX,moveY;
        var winW=$(window).width();
        var winH=$(window).height();
        var barrage_name=$("#barrage_name");
        var barrage_frame=$("#barrage_frame");

        var ball = $('.col1');
        var ball_color = $('.barrage_name');
        var singleClick = false;
        var isOpen = true;
        callback(isOpen);


        cont.on({//绑定事件
            touchstart:function(e){
                startX = e.originalEvent.targetTouches[0].pageX;        //获取点击点的X坐标
                startY = e.originalEvent.targetTouches[0].pageY;    //获取点击点的Y坐标
                //console.log("startX="+startX+"************startY="+startY);
                sX=$(this).offset().left;//相对于当前窗口X轴的偏移量
                sY=$(this).offset().top;//相对于当前窗口Y轴的偏移量
                //console.log("sX="+sX+"***************sY="+sY);
                leftX=startX-sX;//鼠标所能移动的最左端是当前鼠标距div左边距的位置
                rightX=winW-contW+leftX;//鼠标所能移动的最右端是当前窗口距离减去鼠标距div最右端位置
                topY=startY-sY;//鼠标所能移动最上端是当前鼠标距div上边距的位置
                bottomY=winH-contH+topY;//鼠标所能移动最下端是当前窗口距离减去鼠标距div最下端位置

                singleClick = true;

            },
            touchmove:function(e){
                e.preventDefault();
                moveX=e.originalEvent.targetTouches[0].pageX;//移动过程中X轴的坐标
                moveY=e.originalEvent.targetTouches[0].pageY;//移动过程中Y轴的坐标
                //console.log("moveX="+moveX+"************moveY="+moveY);
                if(moveX<leftX){moveX=leftX;}
                if(moveX>rightX){moveX=rightX;}
                if(moveY<topY){moveY=topY;}
                if(moveY>bottomY){moveY=bottomY;}
                $(this).css({
                    "left":moveX+sX-startX,
                    "top":moveY+sY-startY,
                })

                singleClick = false;
            },
            touchend:function(e) {
                if(singleClick){
                    isOpen = !isOpen;
                    if(isOpen){
                        ball.html('关闭调试')
                        ball_color.css({'background':'#00aeff'});
                    }else{
                        ball.html('打开调试')
                        ball_color.css({'background':'#888'})
                    }
                    callback(isOpen);
                }else{
                    console.log("移动事件");
                }
            }
        })
    }
	
	function clear() {
		logEl.innerHTML = '';
	}
	
	function log() {
		return genericLogger(_options.logColor).apply(null, arguments);
	}
	
	function info() {
		return genericLogger(_options.infoColor).apply(null, arguments);
	}
	
	function warn() {
		return genericLogger(_options.warnColor).apply(null, arguments);
	}
	
	function error() {
		return genericLogger(_options.errorColor).apply(null, arguments);
	}
	
	function setOptions(options) {
		for(var i in options)
			if(options.hasOwnProperty(i) && _options.hasOwnProperty(i)) {
				_options[i] = options[i];
			}
	}


	
	function init(options) {
		if (isInitialized) { return; }
		
		isInitialized = true;
		
		if(options) {
			setOptions(options);
		}
		
		logEl = createPanel();
		document.body.appendChild(logEl);
		
		if (!_options.freeConsole) {
			// Backup actual fns to keep it working together
			_console.log = console.log;
			_console.clear = console.clear;
			_console.info = console.info;
			_console.warn = console.warn;
			_console.error = console.error;
			console.log = originalFnCallDecorator(log, 'log');
			console.clear = originalFnCallDecorator(clear, 'clear');
			console.info = originalFnCallDecorator(info, 'info');
			console.warn = originalFnCallDecorator(warn, 'warn');
			console.error = originalFnCallDecorator(error, 'error');
		}

        if(options.touch_ball){
            initTouchBall(isShow);
        }
	}

	function destroy() {
		isInitialized = false;
		console.log = _console.log;
		console.clear = _console.clear;
		console.info = _console.info;
		console.warn = _console.warn;
		console.error = _console.error;
		logEl.remove();
	}

	/**
	 * Checking if isInitialized is set
	 */
	function checkInitialized() {
		if (!isInitialized) {
			throw 'You need to call `screenLog.init()` first.';
		}
	}

	/**
	 * Decorator for checking if isInitialized is set
	 * @param  {Function} fn Fn to decorate
	 * @return {Function}      Decorated fn.
	 */
	function checkInitDecorator(fn) {
		return function() {
			checkInitialized();
			return fn.apply(this, arguments);
		};
	}

	/**
	 * Decorator for calling the original console's fn at the end of
	 * our overridden fn definitions.
	 * @param  {Function} fn Fn to decorate
	 * @param  {string} fn Name of original function
	 * @return {Function}      Decorated fn.
	 */
	function originalFnCallDecorator(fn, fnName) {
		return function() {
			fn.apply(this, arguments);
			if (typeof _console[fnName] === 'function') {
				_console[fnName].apply(console, arguments);
			}
		};
	}

	// Public API
	window.screenLog = {
		init: init,
		log: originalFnCallDecorator(checkInitDecorator(log), 'log'),
		clear: originalFnCallDecorator(checkInitDecorator(clear), 'clear'),
		info: originalFnCallDecorator(checkInitDecorator(clear), 'info'),
		warn: originalFnCallDecorator(checkInitDecorator(warn), 'warn'),
		error: originalFnCallDecorator(checkInitDecorator(error), 'error'),
		destroy: checkInitDecorator(destroy),
		showLog:showLogger,
		hiddenLog:hiddenLogger
	};
})();
