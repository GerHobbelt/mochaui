/*
 ---

 name: Menu

 script: menu.js

 description: MUI - Creates a menu control.

 copyright: (c) 2011 Contributors in (/AUTHORS.txt).

 license: MIT-style license in (/MIT-LICENSE.txt).

 requires:
 - Core/Element
 - Core/Class
 - Core/Options
 - Core/Events
 - MUI
 - MUI.Core

 provides: [MUI.Menu]
 ...
 */

MUI.MenuController = new NamedClass('MUI.MenuController', {

    $active:		false,
    $visibles:	  [],
    $focused:	   [],
    $groupedItems:  {},

    menuIsActivated: function(){
        return this.$activated;
    },

    checkActivated: function(item){
		if(this.$focused.length === 1){
			this.$focused.pop().setActive(false);
			this.$activated = false;
		}
		else if(!item){
			this.hideVisibleMenus();
			while(this.$focused.length > 0)
	            this.$focused.pop().setActive(false);
			this.$activated = false;
		}
		else {
			item.setActive(true);
			this.$focused.push(item);
			this.$activated = true;
		}
    },

    onItemFocus: function(item){
		if(this.$activated){
			var focused = [];
	        while(this.$focused.length > 0){
	            var item2 = this.$focused.pop();
	            if(!item || item2.isParentOf(item))
	                focused.push(item2);
	            else
	                item2.setActive(false);
	        }
	        this.$focused = focused;

			item.setActive(true);
			this.$focused.push(item);
		}
    },

    onItemBlur: function(item){

    },

    addVisibleMenu: function(menu){
        if(menu.isVisible())
            this.$visibles.push(menu);
        return this;
    },

    hideVisibleMenus: function(){
        while(this.$visibles.length > 0){
            this.$visibles.pop().hide();
        }
        return this;
    },

    hideVisibleMenusExceptParents: function(fromMenu){
        var visibles = [];
        while(this.$visibles.length > 0){
            var menu = this.$visibles.pop();
            if(!menu.isParentOf(fromMenu))
                menu.hide();
            else
                visibles.push(menu);
        }
        this.$visibles = visibles;
        return this;
    },

    hideVisibleMenusExceptThisAndParents: function(fromMenu){
        var visibles = [];
        while(this.$visibles.length > 0){
            var menu = this.$visibles.pop();
            if(!menu.isParentOf(fromMenu) && menu !== fromMenu)
                menu.hide();
            else
                visibles.push(menu);
        }
        this.$visibles = visibles;
        return this;
    },

    addItemToGroup: function(groupName, item){
		if(!this.$groupedItems.groupName)
			this.$groupedItems.groupName = [];
		this.$groupedItems.groupName.push(item);
    },

    removeItemFromGroup: function(groupName, item){
		if(!this.$groupedItems.groupName) return;
		var i = this.$groupedItems.indexOf(item);
		if(i > -1)
			delete this.$groupedItems[i];
    },

    getGroupedItems: function(groupName){
		if(!this.$groupedItems.groupName) return [];
		return this.$groupedItems.groupName;
    }
});

MUI.MenuItemContainer = new NamedClass('MUI.MenuItemContainer', {

    Implements: [Events, Options],

	options: {
		id:				'',				// id of the primary element, and id os control that is registered with mocha
		container:		null,			// the parent control in the document to add the control to
		drawOnInit:		true,			// true to add tree to container when control is initialized
		partner:		false,			// default partner element to send content to
		partnerMethod:	'xhr',			// default loadMethod when sending content to partner
		fromHTML:		false,			// default false, true to load menu from html

		this.fireEvent('hide', [this]);
		return this;
	},

	isVisible: function(){
		return this.$visible;
	},

	getDottedId: function(){
		return this.$dottedId;
	},

    isParentOf: function(item){
        return item.getDottedId().contains(this.getDottedId());
    },

    getDepth: function(){
		var da = this.getDottedId().split('.');
		return (da.length + 1) / 2;
    },

	onItemClick: function(item, e){
		this.fireEvent('itemClick', [this, item, e]);
	},

	onItemClicked: function(item, e){
		this.fireEvent('itemClicked', [this, item, e]);
	},

	onItemFocus: function(item, e){
		this.fireEvent('itemFocus', [this, item, e]);
	},

	onItemFocused: function(item, e){
		this.fireEvent('itemFocused', [this, item, e]);
	},

	onItemBlur: function(item, e){
		this.fireEvent('itemBlur', [this, item, e]);
	},

	onItemBlurred: function(item, e){
		this.fireEvent('itemBlurred', [this, item, e]);
	}

});

MUI.Menu = new NamedClass('MUI.Menu', {

    Extends: MUI.MenuItemContainer,

	options: {
		id:               '',              // id of the primary element, and id os control that is registered with mocha
		container:        null,            // the parent control in the document to add the control to
		drawOnInit:       true,            // true to add tree to container when control is initialized
		partner:          false,           // default partner element to send content to
		partnerMethod:    'xhr',           // default loadMethod when sending content to partner

		content:          false,           // used to load content
		items:            {},              // menu items for the menu to draw

		cssClass:         'toolMenu',      // css tag to add to control
		divider:          true,            // true if this toolbar has a divider
		orientation:      'left'           // left or right side of dock.  default is left

		//onDrawBegin:null                 // event: called when menu is just starting to be drawn
		//onDrawEnd:null                   // event: called when menu is has just finished drawing
		//onItemDrawBegin:null             // event: called when menu item is just starting to be drawn
		//onItemDrawEnd:null               // event: called when menu item is has just finished drawing
		//onItemClicked:null               // event: when a menu item is clicked
		//onItemFocused:null               // event: when a menu gains focus
		//onItemBlurred:null               // event: when a menu losses focus
	},

	initialize: function(options){
		this.setOptions(options);
        this.$controller = new MUI.MenuController();

		// If menu has no ID, give it one.
		var id = this.id = this.options.id = this.options.id || 'menu' + (++MUI.idCount);
		MUI.set(id, this);

		if (this.options.drawOnInit && !self.fromHTML) this.draw();
		else if (self.fromHTML){
			window.addEvent('domready', function(){
				var el = $(id);
				if (el != null) self.fromHTML(el);
			});
		}
	},

	draw: function(container){
		this.fireEvent('drawBegin', [this]);
		var o = this.options;
		container = container || o.container;

		// determine element for this control
		var isNew = false;
		var div = o.element ? o.element : $(o.id);
		if (!div){
			div = new Element('div', {'id': o.id});
			isNew = true;
		}
		div.empty();

		div.addClass('mui-toolbar');
		if (o.cssClass) div.addClass(o.cssClass);
		if (o.divider) div.addClass('mui-divider');
		if (o.orientation) div.addClass(o.orientation);

		this.el.container = div.store('instance', this);

		this.items = o.items;
		this.drawItems({
			cssClass: o.cssClass,
			subMenuAlign: { bottom: 3, left: 0 }
		});

		// add to container
		var addToContainer = function(){
			if (typeOf(container) == 'string') container = $(container);
			if (div.getParent() === null) div.inject(container);
			this.fireEvent('drawEnd', [this]);
		}.bind(this);
		if (!isNew || typeOf(container) == 'element') addToContainer();
		else window.addEvent('domready', addToContainer);

		return this;
	}

});


MUI.MenuItem = new NamedClass('MUI.MenuItem', {

	Implements: [Events, Options],

	options: {
		drawOnInit:    true,
		cssClass:      '',      // css tag to add to control
		items:         [],
		text:          '',
		id:            '',
		registered:    '',
		url:           '',
		target:        '_blank',
		type:          '',      // 'check', 'radio', 'image' or leave blnak for default
		partner:       '',
		partnerMethod: 'xhr'
	},

	_buildItems:function(ul, items, addArrow){
		for (var i = 0; i < items.length; i++){
			this.fireEvent('itemDrawBegin', [this, item]);
			var item = items[i];
			if (item.type == 'divider') continue;
			var li = new Element('li').inject(ul);
			if (i > 0 && items[i - 1].type == 'divider') li.addClass('mui-divider');
			var a = new Element('a', {text:item.text}).inject(li);
			if (item.type == 'radio') new Element('div', {'class':(item.selected ? 'radio' : 'noradio')}).inject(a);
			if (item.type == 'check') new Element('div', {'class':(item.selected ? 'check' : 'nocheck')}).inject(a);

			// add anchor target
			if (item.target) a.setAttribute('target', item.target);

			// capture click, and suppress anchor action if there is no target
			if (!item.target) a.addEvent('click', MUI.getWrappedEvent(this, this.onItemClick, [item]));

			// determine partner settings
			var partner = item.partner ? item.partner : this.options.partner;
			var partnerMethod = item.partnerMethod ? item.partnerMethod : this.options.partnerMethod;

			var url = MUI.replacePaths(item.url);
			if (!url || item.registered){
				url = '#';
				if (item.registered && item.registered != '')
					a.addEvent('click', MUI.getRegistered(this, item.registered, [item]));
			} else if (item.partner) a.addEvent('click', MUI.sendContentToPartner(this, url, partner, partnerMethod));
			else a.setAttribute('href', url);

			a.addEvent('mouseleave', function(e){ e.stop();});
			li.addEvent('mouseenter', function(e){
				var ul = e.target.getParent('ul');
				ul.getChildren('li').removeClass('hover');
				ul=this.getChildren('UL');
				this.addClass('hover');
			}).addEvent('mouseleave', function(e){
				console.log(e.target.tagName);
				this.removeClass('hover');
			});

		this.el.container = container.toElement();

		if (this.options.drawOnInit) this.draw();
	},

	draw: function(){
		this.fireEvent('drawBegin', [this]);
		var options = this.options;

		this.el.item = new Element('div', {
			'class': options.cssClass + ' mui-menu-item depth-' + this.getDepth(),
			text: options.text
		}).inject(this.el.container);

		if(!!options.id)
			this.el.item.set('id', options.id);

		this.attachEvents();

		this.fireEvent('drawEnd', [this]);
	},

	getDottedId: function(){
		return this.$dottedId;
	},

    isParentOf: function(item){
        return item.getDottedId().contains(this.getDottedId());
    },

    getDepth: function(){
		var da = this.getDottedId().split('.');
		return da.length / 2;
    },

	attachEvents: function(){
		var self = this,
			options = this.options;
		this.el.item.addEvents({
			'click': function(e){
				self.fireEvent('click', [self, e]);
				if(!self.isLink()) e.stop();

				self.$controller.checkActivated(self);

				// determine partner settings
				var partner = options.partner,
					partnerMethod = options.partnerMethod,
					registered = options.registered,
					url = MUI.replacePaths(options.url),
					hide = false;
				if(!url || registered){
					url = '#';
					if(registered && registered !== ''){
						MUI.getRegistered(self, registered, [self.options])(e);
						hide = true;
					}
				}
				else if(partner){
					MUI.sendContentToPartner(self, url, partner, partnerMethod)(e);
					hide = true;
				}
				else {
					document.location.href = url;
				}

				if(hide)
					self.$controller.checkActivated();

				self.fireEvent('clicked', [self, e]);
			},
			'mouseenter': function(e){
				self.fireEvent('focus', [self, e]);

				self.$controller.onItemFocus(self);

				self.fireEvent('focused', [self, e]);
			},
			'mouseleave': function(e){
				self.fireEvent('blur', [self, e]);
				self.$controller.onItemBlur(self);
				self.fireEvent('blurred', [self, e]);
			}
		});
	},

	isLink: function(){
		return this.options.url !== '';
	},

	setActive: function(state){
		if(!!state)
			this.el.item.addClass('active');
		else
			this.el.item.removeClass('active');
	}

});

MUI.MenuItemDivider = new NamedClass('MUI.MenuItemDivider', {

	Extends: MUI.MenuItem,

	draw: function(){
		this.fireEvent('drawBegin', [this]);
		var options = this.options;

		this.el.item = new Element('div', {
			'class': options.cssClass + ' mui-menu-item-divider depth-' + this.getDepth()
		}).inject(this.el.container);

		if(!!options.id)
			this.el.item.set('id', options.id);

			if (item.id) a.setAttribute('id', item.id);

			this.fireEvent('itemDrawEnd', [this, item]);
		}

		this.attachEvents();

		this.fireEvent('drawEnd', [this]);
	},

	attachEvents: function(){
		var self = this;
		this.el.item.addEvents({
			'click': function(e){
                if(this.hasClass('more')){
                    var coords = { x: 0, y: 0 },
						itemCoords = this.getCoordinates();

					Object.each(self.options.subMenuAlign, function(margin, align){
						switch(align){
							case 'top':
							case 'bottom':
								coords.y = itemCoords[align] + margin;
								break;

							case 'left':
							case 'right':
								coords.x = itemCoords[align] + margin;
								break;
						}
					});

					self.$subMenu.toggle(coords);
				}
			},
			'mouseenter': function(e){
                self.$controller.hideVisibleMenusExceptThisAndParents(self.$container);

				if(self.$controller.menuIsActivated() && this.hasClass('more')){
					var coords = { x: 0, y: 0 },
						itemCoords = this.getCoordinates();

					Object.each(self.options.subMenuAlign, function(margin, align){
						switch(align){
							case 'top':
							case 'bottom':
								coords.y = itemCoords[align] + margin;
								break;

							case 'left':
							case 'right':
								coords.x = itemCoords[align] + margin;
								break;
						}
					});

					self.$subMenu.show(coords);
				}
			}
		});

		this.parent();
	}
});

MUI.CheckboxMenuItem = new NamedClass('MUI.CheckboxMenuItem', {

	Extends: MUI.MenuItem,

	$selected: false,

	initialize: function(controller, container, parentDdottedId, options){
		options = Object.merge({
			selected: false
		}, options);
		this.parent(controller, container, parentDdottedId, options);
	},

	draw: function(){
		this.parent();

		new Element('span', {
			'class': 'checkicon'
		}).inject(this.el.item, 'top');

		this.el.item.addClass('checkbox');

		if(this.options.selected)
			this.setSelected(true);
	},

	attachEvents: function(){
		var self = this;
		this.el.item.addEvent('click', function(e){
			this.toggleClass('checkbox');
			self.fireEvent('changed', [self]);
		});
		this.parent();
	},

	onItemBlur: function(e, item){
		self.fireEvent('itemBlurred', [this, item, e]);
		return true;
	},

	fromHTML: function(div){
		var self = this,o = this.options;

		if (!div) div = $(o.id);
		if (!div) return self;
		if (div.get('class')) o.cssClass = div.get('class');

		var ul = div.getChildren("ul");
		if (ul.length > 0) o.items = this._fromHtmlChildren(ul[0]);

		self.draw();
		return self;
	},

	_fromHtmlChildren: function(ul){
		var list = [];
		Object.each(ul.getChildren('li'), function(li){
			if (typeof(li) != 'object' && typeof(li) != 'element') return;
			if (li.hasClass('divider') || li.hasClass('mui-divider')) list.push({'type':'divider'});
			var item = {};
			var a = li.getChildren('a');
			item.text = a.get('text');
			if (!item.text) return;
			var tgt = a.get("target");
			if (tgt) item.target = tgt;
			var href = a.get("href");
			if (href) item.url = href;

			var subul = li.getChildren('ul');
			if (subul && subul.length > 0) item.items = this._fromHtmlChildren(subul[0]);

			list.push(item);
		}, this);
		return list;
	}
});

/*
MUI.ImageMenuItem = new NamedClass('MUI.ImageMenuItem',  {

	Extends: MUI.MenuItem,

	draw: function(){
		this.parent();

		this.el.item.addClass('image');
	}
});
*/



// [i_a] mochaUI lazyloading is crappy; this provides a way around it, when you provide your own load sequence / lazy loader
if (window.MUI && window.MUI.files) { MUI.files['{controls}menu/menu.js'] = 'loaded'; }

