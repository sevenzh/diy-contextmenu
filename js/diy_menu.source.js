/**
 * @param description 模拟右键菜单
 * @param opts {Object}
 * @param author 万戈 i@wange.im
**/
var DiyMenu = function(opts) {
	var that = this;
	
	that.els = {};
	that.st = {
		defHref: 'javascript:;',					// 默认链接
		menuDisableClass: 'menu_disable',			// li.menu_disable
		menuAbleClass: 'menu_able',					// li.menu_able
		menuMoreClass: 'menu_more',					// li.menu_more
		data: []
	}
};

/**
 * @param description 定义菜单列表的 class 和 icon，包括子菜单
 * @param return {Object} 返回设置菜单的条件，包括 li 的 class，icon 以及子菜单
**/
DiyMenu.prototype._setMenu = function(fn, url, icon, sub) {
	var that = this,
		st = that.st,
		liClass = '',
		iconImg = '',
		subMenu = '';
	
	// 定义 class
	if (typeof fn === 'undefined' && url === st.defHref && typeof sub === 'undefined') {	// 如果没有要绑定的方法，也没有要跳转的链接
		liClass = st.menuDisableClass;
	} else if (typeof sub !== 'undefined') {						// 如果有子菜单
		liClass = st.menuMoreClass;
		
		// 拼接子菜单
		subMenu += '\n<div class="sub_menu menu_box" style="display:none;">' + '\n' +
					'<div class="menu_box_inner">' + '\n' +
					'<ul class="menu_level_b">' + '\n';
		
		// 遍历子菜单
		for (var i=0, l=sub.length; i<l; i++) {
			var subText = sub[i].text,
				subFn = sub[i].fn,
				subUrl = sub[i].url || st.defHref,
				subIcon = sub[i].icon;
				
			var setSubMenuObj = that._setMenu(subFn, subUrl, subIcon);
			
			subMenu += '<li class="' + setSubMenuObj.menuClass + ' sub_menu_li">' + setSubMenuObj.menuIcon + '<a href="' + subUrl + '" target="_blank">' + subText + '</a></li>' + '\n';
		}
		subMenu +='</ul>' + '\n' +
					'</div>' + '\n' +
					'</div>' + '\n	';
	} else {
		liClass = st.menuAbleClass;
	}
	
	// 定义 icon
	if (typeof icon !== 'undefined') {
		iconImg = '<img class="icon" src="' + icon + '" alt="" />';
	}
	
	return {
		menuClass: liClass,
		menuIcon: iconImg,
		menuSub: subMenu
	}
};

/**
 * @param description 获取元素
**/
DiyMenu.prototype._getElements = function() {
	this.els = {
		menu: $('#menu'),
		menuBox: $('.menu_box'),
		menuLevelA: $('.menu_level_a'),
		menuMore: $('.menu_more'),
		menuLi: $('.menu_level_a li'),
		subMenuLi: $('.sub_menu_li')
	}
};

/**
 * @param description 设置菜单样式
**/
DiyMenu.prototype._setStyle = function(pageX, pageY, clientY) {
	var els = this.els;
	els.menuLevelA.first().addClass('border_top_none');
	els.menuLevelA.last().addClass('border_bottom_none');
	
	els.menu.css({
		left: pageX,
		top: pageY
	});
	
	
	var winWidth = $(window).outerWidth(true),
		winHeight = $(window).outerHeight(true),
		menuWidth = els.menu.outerWidth(true),
		menuHeight = els.menu.outerHeight(true);
		
		
	if (menuWidth + pageX > winWidth) {
		els.menu.css({
			left: pageX - menuWidth
		});
	}
	if (menuHeight + clientY > winHeight) {
		els.menu.css({
			top: pageY - menuHeight
		});
	}
};

/**
 * @param description 移除菜单
**/
DiyMenu.prototype._remove = function() {
	var els = this.els;
	if (typeof els.menu !== 'undefined') {
		els.menu.remove();
	}
};

/**
 * @param description 绑定事件
**/
DiyMenu.prototype._bind = function() {
	var that = this,
		els = that.els,
		st = that.st;
		
	// 点击有子菜单的列表
	els.menuMore.bind({
		mouseenter: function() {
			var _this = $(this);
			_this.addClass('menu_hover').find('.sub_menu').show(0, function() {
				var subMenu = $('.sub_menu', _this),
					subMenuL = subMenu.offset().left,
					subMenuW = subMenu.outerWidth(true),
					winW = $(window).outerWidth(true);
					
				if (subMenuL + subMenuW > winW) {
					var menuW = els.menu.outerWidth(true),
						subPosL = subMenu.position().left;
					$('.sub_menu', _this).css({
						left: subPosL - subMenuW - menuW + 12
					});
				}
			});
			
			
		},
		mouseleave: function() {
			var _this = $(this);
			_this.removeClass('menu_hover').find('.sub_menu').hide();
		}
	});
	
	// 点击菜单列表
	els.menuLi.bind({
		click: function(ev) {
			ev.preventDefault();
			ev.stopPropagation();
			var _this = $(this),
				subIndex = -1;
			if (_this.hasClass('sub_menu_li')) {
				
				subIndex = _this.index();
				_this = _this.parents('.menu_li');
			}
			var _thisParents = _this.parents('.menu_level_a'),
				ulIndex = _thisParents.index(),
				liIndex = _this.index();
			
			var stData = st.data[ulIndex][liIndex],
				stSub = stData.sub,
				stSubData = stSub && stSub[subIndex];

			if (stData) {
				if (stSub && stSubData) {
					if (stSubData.fn) {
						stSubData.fn();
						that._remove();
					} else if (stSubData.url) {
						window.open(stSubData.url);
						that._remove();
					}
				} else if (stData.fn) {
					stData.fn();
					that._remove();
				} else if (stData.url) {
					window.open(stData.url);
					that._remove();
				}
			}
		}
	});
};

/**
 * @param description 根据参数拼接生成 DOM
**/
DiyMenu.prototype._fill = function(pageX, pageY, clientY) {
	var that = this,
		st = that.st,
		data = st.data,
		menuLevelUl = '';
	
	// 遍历菜单组
	for (var groupI=0, groupL=data.length; groupI<groupL; groupI++) {
		menuLevelUl += '<ul class="menu_level_a">' + '\n';
		// 遍历单组菜单
		for (var i=0, dataGroupI=data[groupI], l=dataGroupI.length; i<l; i++) {
			var text = dataGroupI[i].text,						// 显示的文案
				fn = dataGroupI[i].fn,							// 回调的方法
				url = dataGroupI[i].url || st.defHref,		// 跳转的链接
				icon = dataGroupI[i].icon,						// 显示的图标
				sub = dataGroupI[i].sub;						// 子菜单列表

			var setMenuObj = that._setMenu(fn, url, icon, sub);
			menuLevelUl += '<li class="' + setMenuObj.menuClass + ' menu_li">' + setMenuObj.menuIcon + '<a href="' + url + '" target="_blank">' + text + '</a>' + setMenuObj.menuSub + '</li>' + '\n';
		}
		menuLevelUl += '</ul>' + '\n';
	}
	
	var diyMenuHtml = '<div id="menu" class="menu_box">' + '\n' +
						'<div class="menu_box_inner">' + '\n' +
								menuLevelUl + '\n' +
						'</div>' + '\n' +
						'</div>';
						
	$(function() {
		$(document.body).append(diyMenuHtml);
		
		that._getElements();
		that._bind();
		that._setStyle(pageX, pageY, clientY);
	});
};

/**
 * @param description 禁止默认右键菜单
**/
DiyMenu.prototype._banDefault = function() {
	var that = this;
	
	$(function() {
		$(window).bind({
			// 禁示默认的右键菜单
			'contextmenu': function() {
				return false;
			},
			
			// 绑定自定义的右键菜单
			'mousedown': function(ev) {
				// 判断鼠标是否在 #menu 元素内
				var mouseLeaveMenu = $(ev.target).parents('#menu').length === 0 ? true : false;
				
				if (mouseLeaveMenu) {
					that._remove();
					if (ev.which === 3) {
						that._fill(ev.pageX, ev.pageY, ev.clientY);
					}
				}
			},

			// 绑定键盘事件
			'keydown': function(ev) {
				if (ev.which === 93) {
					that._remove();
					that._fill(0, $(window).scrollTop(), 0);
				}
			}
		});
		// 过滤虚线框
		$('a,input[type="submit"],object').live('focus', function () {
			if (this.blur) {
				this.blur();
			}
		});
	});
};

/**
 * @param description 初始化传参
**/
DiyMenu.prototype.init = function(opts) {
	var that = this;
	
	// 不支持 ie
	if ($.browser.msie) {
		return;
	}
	
	$(function() {
		if (opts && typeof opts === 'object') {
			$.extend(that.st, opts);
		}
		that._banDefault();
	});
};