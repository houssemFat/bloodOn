sPot.Tools = {}
/**
 * connect an autocomplete to server 
 * @param {Element} obj
 * @param {Object} data
 * @param {Object} parentCtx
 * @param {function} fnclick
 * @export
 */
sPot.Tools.truncate = function (string, length, etc , break_words, middle){
	var length_ = length || 80 ,
		etc_ = etc || '...' ,
		break_words = break_words || false ,
		middle = middle || false ,
		strLength = string.length;
    if (strLength){
        length = Math.min (length, strLength);
        if (!break_words && !middle) {
            string = string.replace ('/\s+?(\S+)?$/', '');
        } 
        if (!middle) {
            return string.substr(0, length) + etc ;
        }
        return string.substr(0, length / 2) + $etc + string.substr(0, length / 2);
    }
    return string;
}
/**
 * connect an autocomplete to server 
 * @param {Element} obj
 * @param {Object} data
 * @param {Object} parentCtx
 * @param {function} fnclick
 * @export
 */
sPot.Tools.autoComplete = function (obj, data, options){
	var context = this ;
    this.inputSource_ = obj ; 
    this.sourceAuto_ =  $('#autocomplete')[0];
	this.fakeInput_ =  $('<input id="fake_input" type="text" style="display:none;width:0px;height:0px"/>').appendTo($('body'))[0];
    this.index_ = 0 ;
	this.maxIndex_ = 0 ;
	this.data_ = data ;
	this.url_ = '' ;
	if (options){
		this.parent_ = options.scope ? options.scope  : null ;
		this.fnclick_ =  options.fn ? options.fn  : null ;
		this.fnParams_ =  options.params ? options.params  : null ;
		if (options.url)
			this.url_ = options.url ; 
	}
	this.objects_ = null ;
	this.event_ = '' ;
	$(obj)	.blur (function (){setTimeout (function (){$(context.sourceAuto_).hide();}, 500);})
			.keyup ( function (event) {
					context.excuteAuto.call(context, this, event || window.event);
					return false;
				});
	$(this.fakeInput_).keyup ( function (event) {
						context.excuteAuto.call(context, obj, event || window.event);
					return false;
				});
			//
}
sPot.Tools.autoComplete.prototype	= {
	excuteAuto :  function (obj, event) {
					var context = this ;
					var e = event || window.event || this.event ;
					switch (e.keyCode ){
						// enter key 
						case 13 :
							if ((this.maxIndex_ > -1 ) && (this.index_ > -1)){
								if (this.parent_ && this.fnclick_ && this.objects_){
									context.fireEvent (this.objects_[this.index_]);
								}
							}							
							this.index_ = -1 ;
							return false ;
						case 40 :
							this.runThrough ("down");
						break ;
						case 38 :
							this.runThrough ("up");
						break ;
						// char code
						default :
							if (this.sourceAuto_ != null){
								if (obj.value.length > 0 ){
									if (obj.lastValue_ != obj.value)
											this.sendRequest.call(this, obj.value);
								}
								else 
									sPot.hide (this.sourceAuto_);
								obj.lastValue_ = obj.value ;
							}
						this.running = false ;          
						break ;
					}
				},
	sendRequest : function (key){
					var context = this ;
					if (key == '' || this.send_)
						return ;
					$.ajax({
							type		: 'GET',
							url			:  this.url_ +  '?q=' + key,
							dataType	: 'text',
							success		: function (response){context.getResponse.call (context, response);},
							data 		: (typeof(this.data_) === 'function') ? this.data_ () : this.data_ 
						});
					this.send_ = true ;
				},
	getResponse : function (response){
					var context = this ;
					$(this.sourceAuto_).empty();
					$(this.sourceAuto_).append(response);
					var objects = $('.auto', this.sourceAuto_) ;
					if (objects.length > 0){
						objects.click (function (){ 
										if (context.parent_ && context.fnclick_)
										context.fireEvent (this);
										});
						// to improve 
						sPot.Widget.display (
												this.sourceAuto_, 	
												this.inputSource_ , 
												{
													"vertical" : 'bottom', 
													"horizontal" : 'right' ,
													"position" : 'vertical', 
													"vAdjust" : 2, 
													"hAdjust" : 0
												}
											);
						this.objects_ = objects ;
						this.maxIndex_ = objects.length - 1 ;
						this.index_ = -1 ;
						//this.fakeInput_.select ();
						//
					}
					else {
						sPot.hide (this.sourceAuto_);
					}
					this.send_ = false ;
				},
	runThrough : function (way){
					var index_ = this.index_ ;
					if ( this.maxIndex_ != null ){
						if (way == "down"){
								// fin  de la liste 
							   if ( index_ == this.maxIndex_ ){
									// intial value 
									this.changeBackgroundColor (index_, "") ;
									this.index_ = -1 ;
							   }
							   else { 
									if (index_ == - 1 ){	
										this.changeBackgroundColor (this.maxIndex_, "") ;
									}
									else
										this.changeBackgroundColor (index_, "") ;
										this.changeBackgroundColor (++this.index_, "#CCC", true) ;
							   }
						}
						else {
							if (this.index_ == -1 ){
								this.index_ = this.maxIndex_ ;
								this.changeBackgroundColor (this.index_, "#CCC", true) ;
							}
							else {
								this.changeBackgroundColor (this.index_--, "");
								if (this.index_ == - 1 ){
									this.changeBackgroundColor (0, "");
								}
								else{
									this.changeBackgroundColor (this.index_, "#CCC", true) ;
								}
							}
						}
						if (this.index_ == - 1)
							this.inputSource_.select ();
						else 
							this.fakeInput_.select ();
					}
				},
	changeBackgroundColor : function (index, color, select ){
				this.objects_ [index].style.backgroundColor = color;
				},
	fireEvent : function (object){
		this.fnclick_.call (this.parent_, {'type' : 'object',  'object' : object , 'params' : this.fnParams_});
		sPot.hide (this.sourceAuto_);
	}
}