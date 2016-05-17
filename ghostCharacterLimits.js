;( function($, window) {
  /*****
   * Ghost Character Limits
   * Given a container element, it adds a character limit that is applied to any inputs in the container
   */
  // Methods for ghost character limits
  var gclmethods = {
    init : function(options){
      var $this = $(this),
          limit = options.limit;
      // default set the remaining characters to the limit that was passed.
      $this.attr('remaining-charcount', options.limit);
      // destroy the methods on init - causes weirdness when reapplied.
      gclmethods.destroy.apply($this, []);
      // Find all inputs and adjust character limit for all.
      $this.find('input').each(function(){
        var me = $(this);
        // On keypress, count the number of characters for all inputs contained
        me.on('keypress.ghostCharacterLimits', function(e){
          var count = 0; // set default 0 count
          // If the limit has been reached, prevent default action
          if(options.limit == parseInt($this.attr('total-charcount')) || parseInt($this.attr('remaining-charcount')) <= 0){
            e.preventDefault();
          } else {
            // Count all of the charcounts for all inputs
            $this.find('input').each(function(){
              var me2 = $(this),
                  num = 0;//By default 1 for keypress
              if(typeof me2.attr('data-charcount') != 'undefined'){
                num = parseInt(me2.attr('data-charcount'));
              }
              count += num;
            });
            $this.attr('total-charcount', count);
            // Set the remaining count in the appended text.
            var remainingCount = options.limit - count;
            $this.attr('remaining-charcount', remainingCount);
            $this.find('.remaining-count').text(remainingCount);
          }
        });
        // keydown is the first event to fire
        // On keydown, if key can be ignored, update the data-charcount
        // Before it was considering tabs as characters to count
        me.on('keydown.ghostCharacterLimits', function(e){
          var ignoreKey = gclmethods.ignoreKeyCode(e.keyCode);
          if(ignoreKey == true){
            me.attr('data-charcount', me.val().length + 1); // Set the attr data-charcount to the total length of the input
          }
        });
        // keyup is the last event to fire
        //
        me.on('keyup.ghostCharacterLimits', function(e){
          // Captures and calculates counts when backspace is clicked
          if(e.keyCode == 8 && $this.attr('total-charcount') >= 0){
            var charCount = gclmethods.getCharacterCount.apply($this, []); // gets the character count
            $this.attr('total-charcount', charCount); // sets the charcount for total-charcount attribute on container element
            $this.attr('remaining-charcount', options.limit - charCount); // calculate the remaiing character count
            $this.find('.remaining-count').text($this.attr('remaining-charcount')); // update the remaing character count text
          }
          // If the limit has been reached
          if(options.limit < parseInt($this.attr('total-charcount')) || parseInt($this.attr('remaining-charcount')) < 0){
            // Whateve the focused element is, slice the character that was just added off. Update the rest of the counts.
            $(':focus').val(me.val().slice(0, (me.val().length) - 1)).attr('data-charcount', me.val().length + 1);
            $this.attr('total-charcount', parseInt($this.attr('total-charcount'))-1);
            $this.attr('remaining-charcount', parseInt($this.attr('remaining-charcount'))+1);
            $this.find('.remaining-count').text($this.attr('remaining-charcount'));
          }
        });
      });

      // Append content count verbiage to parent
      if($(this).find('.content-limit').length <= 0){
        $this.append('<div class="content-limit"><span>Content limited to ' + options.limit + ' characters, remaining:</span> <strong><span class="remaining-count">' + options.limit + '</span></strong></div>');
      }
      return this;
    },
    // Loops through all of the inputs contained in the container element and gets their character count
    getCharacterCount : function(){
      var $this = this,
          total = 0;
      $this.find('input').each(function(){
        var me = $(this),
            num = 0;//By default 1 for keypress
        me.attr('data-charcount', me.val().length);
        if(typeof me.attr('data-charcount') != 'undefined'){
          num = parseInt(me.attr('data-charcount'));
        }
        total += num;
      });
      return total;
    },
    // Cases of which keys to ignore
    ignoreKeyCode : function(keycode){
      //ignore these keycodes
      var ignore = true;
      switch(keycode){
        case 9: // Tab
          ignore = false;
          break;
        case 8: // Backspace
          ignore = false;
          break;
      }
      return ignore;
    },
    // Removes all characterlimitstoinputs function calls - uses ghostCharacterLimits namespace
    destroy : function(){
      var $this = this;
      $this.find('input').each(function(){
        var me = $(this);
        me.off('keyup.ghostCharacterLimits');
        me.off('keydown.ghostCharacterLimits');
        me.off('keypress.ghostCharacterLimits');
      });
      return this;
    }
  }
  // ghostCharacterLimits plugin
  $.fn.ghostCharacterLimits = function(methodOrOptions) {
    if ( gclmethods[methodOrOptions] ) {
        return gclmethods[ methodOrOptions ].apply( this, Array.prototype.slice.call( arguments, 1 ));
    } else if ( typeof methodOrOptions === 'object' || ! methodOrOptions ) {
        // Default to "init"
        return gclmethods.init.apply( this, arguments );
    } else {
        $.error( 'Method ' +  methodOrOptions + ' does not exist on jQuery.phoneNumberFormatter' );
    }
  }

}(jQuery, window));
