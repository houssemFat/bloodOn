/* ===================================================
 * common.js v0
 * ===================================================
 * Copyright 2013 BloodOn, Inc.
 * ========================================================== */
BloodOn.Profile = function() {
	/**
	 *
	 */
	this.url_ = '%s';
	
};
BloodOn.Profile.prototype = {
	/**
	 *
	 */
	init:function() {
		var context = this ;
		$('#blood_type:eq(0)').change(
			function (){
				context.changeBloodType(this, $("#change_blood_type_button:eq(0)"));
			});
		$('#input_display_name:eq(0)').keyup(
			function (){
				context.changeName(this, $("#change_name_button:eq(0)"));
			}).each (
			function() {
				this.__appLastValue = this.value ;			
			}				
			);
	},
	changeBloodType: function(select, jButton) {
		jButton.button('loading').show();	
		$.ajax({
			type: 'get',
		    	url: this.url_.replace ('%s', 'blood') + '/' + select[select.selectedIndex].value,
		    	success: $.proxy(this.successAjax, this, jButton)
			});
	},
	changeName: function(input, jButton) {
		var name = input.value ;
		if (name.length < 6){
			$(input).css ({'color' :'red'});
			return ;		
		}
		$(input).css ({'color' : ''});
		if  (input.__appLastValue != name){		
			jButton.button('loading').show();	
			$.ajax({
				type: 'get',
			    	url: this.url_.replace ('%s', 'name') + '/' + input.value,
			    	success: $.proxy(this.successAjax, this, jButton)
			});
		    input.__appLastValue = name ;
		}
	},
	successAjax: function(jButton, response) {
		jButton.button('reset').hide ();
	}

};
$(function() {
	var __appProfile = (new BloodOn.Profile ()).init();
});
