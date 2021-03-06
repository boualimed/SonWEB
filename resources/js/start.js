$( document ).on( "ready", function () {
	deviceTools();
	updateStatus();
} );


function updateStatus() {
	$( '#content .box_device' ).each( function ( key, box ) {
		
		var device_ip     = $( box ).data( "device_ip" );
		var device_id     = $( box ).data( "device_id" );
		var device_relais = $( box ).data( "device_relais" );
		var device_group  = $( box ).data( "device_group" );
		
		if ( !$( box ).hasClass( "updating" ) ) {
			$( box ).addClass( "updating" );
			
			console.log( "[Start][updateStatus]get status from " + $( box ).data( "device_ip" ) );
			
			if ( device_group == "multi" && device_relais > 1 ) {
				console.log( "[Start][updateStatus]skip multi " + $( box ).data( "device_ip" ) );
				return; //relais 1 will update all others
			}
			
			
			Sonoff.getStatus( device_ip, device_id, device_relais, function ( data ) {
				
				                  if ( data && !data.ERROR && !data.WARNING ) {
					
					                  if ( device_group == "multi" ) {
						                  $( '#content .box_device[data-device_group="multi"][data-device_ip="' + device_ip + '"]' )
							                  .each( function ( key, groupbox ) {
								                  var img           = $( groupbox ).find( "img" );
								                  var src           = "./resources/img/device_icons/"
								                                      + img.data( "icon" )
								                                      + "_%pw.png";
								                  var device_status = eval( "data.StatusSTS.POWER" + $( groupbox )
									                  .data( "device_relais" ) );
								
								                  console.log( device_status.toLowerCase() );
								                  src = src.replace( "%pw", device_status.toLowerCase() );
								                  img.attr( "src", src ).parent().removeClass( "animated" );
								                  $( groupbox ).removeClass( "error" ).find( ".animated" ).removeClass( "animated" );
								                  $( groupbox ).removeClass( "updating" );
							                  } );
					                  } else {
						                  var img           = $( box ).find( "img" );
						                  var src           = "./resources/img/device_icons/"
						                                      + img.data( "icon" )
						                                      + "_%pw.png";
						                  var device_status = data.StatusSTS.POWER || data.StatusSTS.POWER1;
						
						                  src = src.replace( "%pw", device_status.toLowerCase() );
						                  img.attr( "src", src ).parent().removeClass( "animated" );
						                  $( box ).removeClass( "error" ).find( ".animated" ).removeClass( "animated" );
						                  $( box ).removeClass( "updating" );
					                  }
					
					
				                  } else {
					                  console.log( "[Start][updateStatus]ERROR "
					                               + device_ip
					                               + " => "
					                               + data.ERROR
					                               || "Unknown Error" );
					                  if ( device_group == "multi" ) {
						                  $( '#device-list tbody tr[data-device_group="multi"][data-device_ip="' + device_ip + '"]' )
							                  .each( function ( key, groupbox ) {
								                  $( groupbox ).addClass( "error" ).find( ".animated" ).removeClass( "animated" );
								                  $( groupbox ).removeClass( "updating" );
							                  } );
					                  } else {
						                  $( box ).addClass( "error" ).find( ".animated" ).removeClass( "animated" );
						                  $( box ).removeClass( "updating" );
					                  }
				                  }
				                  //console.log( result );
				
			                  }
			);
		}
	} );
	
	
	if ( refreshtime ) {
		console.log( "[Global][Refreshtime]" + refreshtime + "ms" );
		setTimeout( function () {
			updateStatus();
		}, refreshtime );
	} else {
		console.log( "[Global][Refreshtime]Dont refresh" );
	}
	
};

function deviceTools() {
	$( '#content .box_device' ).on( "click", function ( e ) {
		e.preventDefault();
		var device_box = $( this );
		device_box.find( "img" ).effect( "shake", { distance: 3 } );
		var device_ip     = device_box.data( "device_ip" );
		var device_id     = device_box.data( "device_id" );
		var device_relais = device_box.data( "device_relais" );
		Sonoff.toggle( device_ip, device_id, device_relais, function ( data ) {
			if ( data && !data.ERROR && !data.WARNING ) {
				var img           = device_box.find( "img" );
				var src           = "resources/img/device_icons/" + img.data( "icon" ) + "_%pw.png";
				var device_status = data.POWER || eval( "data.POWER" + device_relais );
				src               = src.replace( "%pw", device_status.toLowerCase() );
				img.attr( "src", src ).parent().removeClass( "animated" );
				device_box.removeClass( "error" );
			} else {
				device_box.addClass( "error" );
				console.log( "[Start][toggle]ERROR "
				             + device_ip
				             + " => "
				             + data.ERROR
				             || "Unknown Error" );
			}
		} );
		
		
	} );
}