/*
 ---

 name: CoolClock

 script: muiclock.js

 description: Creates a window to wrap CoolClock

 copyright: (c) 2011 Contributors in (/AUTHORS.txt).

 license: MIT-style license in (/MIT-LICENSE.txt).

 requires:
 - Core/Element
 - Core/Class
 - Core/Options
 - Core/Events
 - MUI
 - MUI.Core
 - MUI.Window

 provides: [CoolClock.clockWindow]

 ...
 */

if(!window.CoolClock) {
	window.CoolClock = function(options) {
		return this.init(options);
	};
	CoolClock.config = {};
}

CoolClock.createWindow = function(skin){
	if (typeof(skin) != 'string') skin = 'mui_'+MUI.options.theme;
	new MUI.Window({
		id: 'clock',
		title: 'Canvas Clock',
		cssClass: 'transparent',
		defaultSkin: skin,
		content: {url: '{plugins}coolclock/demo.html'},
		shape: 'gauge',
		headerHeight: 30,
		width: 160,
		height: 160,
		x: 570,
		y: 140,
		padding: 0,
		onLoaded: function(){
			var id = 'coolClock' + (++MUI.idCount);
			(this.el.content).getElement('.CoolClock').set('id', id);
			new CoolClock({canvasId:id,skinId:skin});
		}
	});
};

MUI.register('CoolClock.createWindow', CoolClock.createWindow);


// [i_a] mochaUI lazyloading is crappy; this provides a way around it, when you provide your own load sequence / lazy loader
if (window.MUI && window.MUI.files) { MUI.files['{plugins}coolclock/muiclock.js'] = 'loaded'; }

