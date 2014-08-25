/* ===================================================
 * main.js v0
 * ===================================================
 * Copyright 2013 Bloodon, Inc.
 * ========================================================== */
/**
 *
 * @constructor
 */
 BloodOn.Main = function() {
   var context = this;   
};
/**
 * 
 */
 BloodOn.Main.prototype = {
     init : function (){
         $('#send_me_as_message').click(
            function() { 
                title = this.lang;
                BloodOn.OrganizationManager.showMessageModal(
                    $(this).attr('object'), title);
                }
        );
         $('.share-item').click(
            function() {
                $(this).closest('.item-actions')
                    .find('.share-inside').slideToggle();
            }
         );
         messageMeApp = new BloodOn.MessageMeManager($('#modal_send_to:eq(0)'));
         messageMeApp.init ();
         BloodOn.OrganizationManager = messageMeApp ;
     }
 };
// init the function
$(document).ready(
    function() {
        BO._main = new BloodOn.Main().init();
    }
);