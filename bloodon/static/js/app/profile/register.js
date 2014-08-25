// register
	$(document).ready (function (){
	// register
	var $registerForm = $('#register_form:eq(0)') ;
	$('input#create_new').click (
			function (){
				$registerForm.show();
				$('#login_form:eq(0)').hide();}
		);
	// login 
	 $('input#already_login').click (
			function (){$('#login_form:eq(0)').show();
			$registerForm.hide();}
	);
	var $passwordColor = $('#password_strength_color:eq(0)', $registerForm[0]),
		$passwordStrength =  $('#password_strength:eq(0)', $registerForm[0]),
		colorChart = {
				'0' : 'red',
				'1'	: 'rgb(223, 206, 85)',
				'2': 'orange',
				'3': 'green',
		}
		$('input#id_password:eq(0)', $registerForm[0]).keyup (
			function (){
				// PASSWORD LENGTH
				var p = this.value ,
					intScore = p.length;
				if(p.length > 0 && p.length <= 4) {                    // length 4 or less
					intScore += p.length;
				}
				else if (p.length >= 5 && p.length <= 7) {	// length between 5 and 7
					intScore += 6;
				}
				else if (p.length >= 8 && p.length <= 15) {	// length between 8 and 15
					intScore += 12;
					//alert(intScore);
				}
				else if (p.length >= 16) {               // length 16 or more
					intScore += 18;
					//alert(intScore);
				}
				
				// LETTERS (Not exactly implemented as dictacted above because of my limited understanding of Regex)
				if (p.match(/[a-z]/)) {              // [verified] at least one lower case letter
					intScore += 1;
				}
				if (p.match(/[A-Z]/)) {              // [verified] at least one upper case letter
					intScore += 5;
				}
				// NUMBERS
				if (p.match(/\d/)) {             	// [verified] at least one number
					intScore += 5;
				}
				if (p.match(/.*\d.*\d.*\d/)) {            // [verified] at least three numbers
					intScore += 5;
				}
				
				// SPECIAL CHAR
				if (p.match(/[!,@,#,$,%,^,&,*,?,_,~]/)) {           // [verified] at least one special character
					intScore += 5;
				}
				// [verified] at least two special characters
				if (p.match(/.*[!,@,#,$,%,^,&,*,?,_,~].*[!,@,#,$,%,^,&,*,?,_,~]/)) {
					intScore += 5;
				}
				
				// COMBOS
				if (p.match(/(?=.*[a-z])(?=.*[A-Z])/)) {        // [verified] both upper and lower case
					intScore += 2;
				}
				if (p.match(/(?=.*\d)(?=.*[a-z])(?=.*[A-Z])/)) { // [verified] both letters and numbers
					intScore += 2;
				}
				// [verified] letters, numbers, and special characters
				if (p.match(/(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!,@,#,$,%,^,&,*,?,_,~])/)) {
					intScore += 2;
				}
				/* check consecutivity 
				if (p.length ){
					var i = 0,
						last = p [0],
						map = {};
						map[last] = 1,
						decrement = 0 ;
					$(p.substr(1).split ('')).each (function (){
						current = this[0] ;
						if ( last ==  current)
							map[current] ++ ;
						else 
							map[current] = 1 ;
						last = this ;
						intScore -= ( map[current] - 1 ) ;
					});
				}*/
				//
				var color = 0 ; 
				if ((50 > intScore ) &&  ( intScore >= 15))
					color = 1 ;
				else if (( 75 > intScore ) &&  ( intScore >= 50))
						color = 2 ;
				else if (intScore >= 75){
					color = 3 ;
				}
				
				intScore = ( intScore > 100 ) ? 100 : intScore ;
				intScore = ( intScore < 0 ) ? 0 : intScore ;
				// check if the password == user name 
				$passwordColor.css ('marginRight', intScore);				
				$passwordStrength.css ('backgroundColor', colorChart[color]);
			}).focus (
					function()
						{$('#password_text_error').remove();}
					);
	}
	);