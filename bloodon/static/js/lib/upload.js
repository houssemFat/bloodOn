/*
 * upload.js - ajax librairie for sPot js framework
 * Copyright (c) sPot Inc. 2012 
 * @author fathallah.houssem@gmail.com (Fathallah Houssem )
 * Dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl.html
 */
 /*
 * Class of uploading a single file using iframe.
 * It contains :
 * 		1 : form that appears to user (file name, browse button , upload file) 
 * 		2 : hidden iframe 
 * main object : upLoad_ : contains = {
 *									@param  {Element} mask Dom element to mask during the upload process
									@param	{Element} fname File input name (disabled to user)
									@param	{Element} uploadBtn	Button upload,
									@param	{Element} browseBtn	Button browse,
									@param	{Array}   exts	accpted file extensions
									@param	{Object}  fns	: { 
												@param {Function} successFn function to execute after the success load,
												@param {Function} params function to call for add a server params inside the form splitted by ';'
												@param {Function} validFn,  Validation function called before the load process begin
												@param {Object} scope , main scope where these function will be executed}
									};
 */
/**
* @export
*/
mslUploader = function (){
	// deprecated , these are global
	var $form,
		$file,
		$iframe,
		$parametres,
		// private 
		widget_,
		activeUploadObject_,
		config_,
		fileCount_ = 1 ,
		uploadDialogIsShown_ = false ;

	/**
	 */
	var getDoc = function (frame) {
		var doc = frame.contentWindow ? frame.contentWindow.document : frame.contentDocument ? frame.contentDocument : frame.document;
		return doc;
	}
	/**
	 */
	var getIframe = function (isMultiple_){
			$iframe = $('<iframe id="global_upload_frame" name="upload_frame" frameborder="0" border="0" src="" scrolling="no" scrollbar="no" style="display:none"></iframe>');
			if (sPot.NAV === 'IE')
				document.body.parentElement.appendChild($iframe[0]);
			else
				document.body.appendChild($iframe[0]);
			$form = $('<form  method="post" id="form"  accept-charset="utf-8" enctype="multipart/form-data"></form>');
			// important for direct body injection
			var innerDocument = getDoc ($iframe[0]);
			if (sPot.NAV === 'IE')
				innerDocument.body.parentElement.appendChild($form[0]);
			else
				innerDocument.body.appendChild($form[0]);
			// $file for 
			$file = $('<input type="file" id="'+ fileCount_ +'" name="file' + ( isMultiple_ ?  '[]" multiple' : '"' ) + ' >') ;
			$file.appendTo ($form[0]).change ( function (){
												change ();
												}
											);
			$parametres = $('<input type="hidden" name="params" value="">').appendTo ($form[0]);
			$parogressBar = $('<input type="hidden" name="progress_bar" value="app">').appendTo ($form[0]);

	}
	/** 
	 * register
	*/
	var buildWidget = function (){
		
		var uploader = $('#global_upload_form')[0];
		var uploadBtn = $("#browse", uploader)[0];
		$(uploadBtn).click (function () {  fire ()});
		$("#upload", uploader).click ( function () {  send () });
		$("#cancel", uploader).click ( function () {  cancel ()});
		
		widget_ = uploader ;
		config_ = true ;
	}
	/** 
	 * register
	 * @param {iframeDocument}  ifram document
	 * @export
	*/
	registerUploader = function (options){
			if (!config_){
				buildWidget ();
			}
			var dom = options.dom,
				max = 10 ;
			if (typeof (options.max) !== 'undefined'){
				var oMax = parseInt(options.max) ;
				if (oMax)
					max = Math.min (oMax, max);
			}
			if (dom){
				// register the click to dom
				$(dom).click ( function (){
					if ($iframe)
						$iframe.remove ();
					fileCount_ = 1 ;
					$("#upload_items", $('#global_upload')[0])[0].innerHTML = '' ;
					activeUploadObject_ = this ;
					activeUploadObject_.isMultiple_ = options.multiple  ;
					getIframe (options.multiple);
					fireClick ();
					uploadDialogIsShown_ = false ;
					//sPot.Widget.displayModal(widget_, '#ccc');
				});
				/*
				options 
				dom, acceptedExts, url, paramsFn, validFn, successFn, scope, mask, successFnPs
				*/
				dom.upLoad_ = {		"exts"			: options.exts,
									"url" 			: options.url ? options.url : '' ,
									"scope"			: options.scope, 
									"fns"				: { 
														"success"  	: options.successFn,
														"successFnPs" : options.successFnPs, 
														"params"		: options.paramsFn,
														"valid"   	: options.validFn
														},
									"max"			:   max
									
								};
			}
	}
	/**
	*/
	function fire (){
		if (activeUploadObject_.max < fileCount_ )
			return ;
		if (activeUploadObject_.isMultiple_ ){
			$file = $('<input type="file" id="'+ (++fileCount_) +'"  name="file[]"  multiple>') ;
			$file.appendTo ($form[0]).change ( function (){
											change ();
											}
										);
		}
		fireClick ();
	}
	function fireClick (){
		$file[0].click ();
	}
	/**
	*/
	function cancel (){
			sPot.Widget.hideModal ();
	}
	/** 
	 * Simulate the change action 
	 * change the file 
	*/  
	function change (){
		var upNames = $("#upload_items", $('#global_upload')[0])[0];
		var fnames = '',
		name,
		exts = activeUploadObject_.upLoad_.exts,
		parentFile = $file[0];
		// alert (file.files.length); 
		for (var i = 0 ; i < parentFile.files.length ; i++){
			name = parentFile.files[i].name ;
			if (sPot.validFileExtensions(name, exts )){
				fnames += name + ( (i < parentFile.files.length - 1) ? ' ,' : '' );
				var $parentName = $('<div style="padding:2 2 2 2"><span class="file-item"><span class="file-item-name">' + name + '</span></span></div>').appendTo(upNames);
				var $deleteSpan = $('<span class="hand file-item-del">x</span>');
				$deleteSpan [0].parent =  $parentName [0];
				$deleteSpan [0].parentFile =  $parentName [0];
				$deleteSpan.appendTo($parentName).click (
						function (){
							$(this.parent).remove();
							$(parentFile).remove();
						}
						// remove file thisfrom list 	
				);
			}
			else 
				$(parentFile).remove();
		}
		if ($('span.file-item:eq(0)', upNames).length < 1){
			uploadDialogIsShown_ = false ;
			sPot.Widget.hideModal();
		}
		else {
			if (uploadDialogIsShown_ === false){
				sPot.Widget.displayModal(widget_, '#ccc');
				uploadDialogIsShown_ = true ;
			}
		}
	};
	/** 
	 * Submit the uplaod form to the server
	 * @param {iframeDocument}  ifram document
	*/ 
	function send () {
		  // look for server aborts
		var form = $form [0],
		iframe = $iframe [0],
		object = activeUploadObject_,
		uploadPs = object.upLoad_,
		url = uploadPs.url,
		parametres = $parametres [0],
		fns = uploadPs.fns ; 
		function checkState() {
			try {
				var state = getDoc(iframe).readyState;
				//log('state = ' + state);
				if (state && state.toLowerCase() == 'uninitialized')
					setTimeout(checkState, 50);
			}
			catch(e) {
				//log('Server abort: ' , e, ' (', e.name, ')');
				cb(SERVER_ABORT);
				if (timeoutHandle)
					clearTimeout(timeoutHandle);
				timeoutHandle = undefined;
			}
		}
		//if (isValid){
			// sPot.mask (uploadFile.upLoad_.mask, 'upolading ...') ;
			// $iframe[0].
			
		var cb = function (event){
			if (iframe.detachEvent)
				iframe.detachEvent('onload', cb);
			else
				iframe.removeEventListener('load', cb, false);
				
			sPot.Widget.hideModal ();
			// progress bar
			/*	setInterval(
					function() {
									sPot.Widget.displayModal($('#progress_container')[0], '#ccc');
									$.get(url + '?RType=progressUploader&randval=' + Math.random(), { 
										//get request to the current URL (upload_frame.php) which calls the code at the top of the page.  It checks the file's progress based on the file id "progress_key=" and returns the value with the function below:
										},
										function(data)    //return information back from jQuery's get request
											{
												//alert (data);
												$('#progress_container').fadeIn(100);    //fade in progress bar    
												$('#progress_bar').width(data +"%");    //set width of progress bar based on the $status value (set at the top of this page)
												$('#progress_completed').html(parseInt(data) +"%");    //display the % completed within the progress bar
											}
										)}
					,500);  //Interval is set at 500 milliseconds (the progress bar will refresh every .5 seconds)
			*/
			// success
			if (fns.success){
				var response = getDoc(iframe).body.innerHTML ;
				if  (fns.successFnPs)
					fns.success.call (uploadPs.scope, fns.successFnPs, response);
				else 
					fns.success.call (uploadPs.scope, response);
			}
		}
			
		if (!iframe.iframeTarget) {
			// add iframe to doc and submit the form
			if (iframe.attachEvent)
				iframe.attachEvent('onload', cb);
			else
				iframe.addEventListener('load', cb, false);
		}
		setTimeout(checkState, 15);
		var isValid = true ;
		// validation 
		if (fns.valid)
			isValid = fns.valid.call (uploadPs.scope);
		//
		if (isValid){
			try {
				form.action = url +"?RType=upload" ;
				if (fns.params)
					form.action += '&' + sPot.getStringParams (fns.params.call (uploadPs.scope));
				form.submit();
			} catch (err) {
				// just in case form has element with name/id of 'submit'
				var submitFn = document.createElement('form').submit;
				submitFn.apply(form);
			}
		}
	}
	
	// helper fn for console logging
	function log() {
		var msg =  Array.prototype.join.call(arguments,'');
		if (window.console && window.console.log) {
			window.console.log(msg);
		}
		else if (window.opera && window.opera.postError) {
			window.opera.postError(msg);
		}
	}
}
mslUploader ();