MUI.files[MUI.path.plugins+"MUI/Layout/Workspaces.js"]="loaded";MUI.extend({saveWorkspace:function(){this.cookie=new Hash.Cookie("mochaUIworkspaceCookie",{duration:3600});this.cookie.empty();MUI.each(function(instance){if(instance.className!="MUI.Window"){return}instance.saveValues();this.cookie.set(instance.options.id,{id:instance.options.id,top:instance.options.y,left:instance.options.x,width:instance.contentWrapperEl.getStyle("width").toInt(),height:instance.contentWrapperEl.getStyle("height").toInt()})}.bind(this));this.cookie.save();new MUI.Window({loadMethod:"html",type:"notification",addClass:"notification",content:"Workspace saved.",closeAfter:"1400",width:200,height:40,y:53,padding:{top:10,right:12,bottom:10,left:12},shadowBlur:5,bodyBgColor:[255,255,255]})},windowUnload:function(){if($$(".mocha").length==0&&this.myChain){this.myChain.callChain()}},loadWorkspace2:function(workspaceWindows){workspaceWindows.each(function(workspaceWindow){windowFunction=eval("MUI."+workspaceWindow.id+"Window");if(windowFunction){eval("MUI."+workspaceWindow.id+"Window({width:"+workspaceWindow.width+",height:"+workspaceWindow.height+"});");var windowEl=$(workspaceWindow.id);windowEl.setStyles({top:workspaceWindow.top,left:workspaceWindow.left});var instance=windowEl.retrieve("instance");instance.contentWrapperEl.setStyles({width:workspaceWindow.width,height:workspaceWindow.height});instance.drawWindow()}}.bind(this));this.loadingWorkspace=false},loadWorkspace:function(){cookie=new Hash.Cookie("mochaUIworkspaceCookie",{duration:3600});workspaceWindows=cookie.load();if(!cookie.getKeys().length){new MUI.Window({loadMethod:"html",type:"notification",addClass:"notification",content:"You have no saved workspace.",closeAfter:"1400",width:220,height:40,y:25,padding:{top:10,right:12,bottom:10,left:12},shadowBlur:5,bodyBgColor:[255,255,255]});return}if($$(".mocha").length!=0){this.loadingWorkspace=true;this.myChain=new Chain();this.myChain.chain(function(){$$(".mocha").each(function(el){this.closeWindow(el)}.bind(this))}.bind(this),function(){this.loadWorkspace2(workspaceWindows)}.bind(this));this.myChain.callChain()}else{this.loadWorkspace2(workspaceWindows)}}});