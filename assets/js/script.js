const displayField = document.querySelector('#display');
var isLastCharOp = false;

document.addEventListener('DOMContentLoaded', function(){

    document.addEventListener('keydown', (e) => {
        e.preventDefault();

        var keyName = [];

        if(e.metaKey) keyName.push('win');
        if(e.ctrlKey) keyName.push('ctrl');
        if(e.shiftKey) keyName.push('shift');

        keyName.push(e.key.toLowerCase());
        keyName = keyName.join('+');

        var btn = document.querySelector('#table span[data-key-value="' + keyName + '"]');
        if(typeof btn == 'undefined' || btn == null) return;

        btn.classList.add('clicked');
        setTimeout(() => {
            btn.classList.remove('clicked');
        },250);

        btn.querySelector('button').click();
    });

});

function isError(){
    return (displayField.value) == 'ERROR' || parseFloat(displayField.value) == Infinity;
}

function putNum(val){
    if(isError()) return;
    
    if(displayField.value == '0') {
        displayField.value = val;
        return;
    }
    displayField.value = displayField.value + val;
    isLastCharOp = false;
    displayField.scrollLeft = displayField.scrollWidth;
}

function placePercent(){
    if(isError()) return;

    if(isLastCharOp) return;

    if(displayField.value == '0') return;

    displayField.value = displayField.value + '%';
    displayField.scrollLeft = displayField.scrollWidth;
}

function placeDecimal(){
    if(isError()) return;

    if(displayField.value.search(/(\.[\d]*)$/) >= 0) return;

    displayField.value += '.';
    isLastCharOp = false;
    displayField.scrollLeft = displayField.scrollWidth;
}

function operation(val){
    if(isError()) return;

    if(val != '-' && (displayField.value == '0')) return;

    if(isLastCharOp){
        displayField.value = displayField.value.substr(0,displayField.value.length-1) + val;
        displayField.scrollLeft = displayField.scrollWidth;
        return;
    }

    isLastCharOp = true;
    displayField.value += val;
    displayField.scrollLeft = displayField.scrollWidth;
}

function clearDisplay() {
    displayField.value = '0';
    isLastCharOp = false;
}

function deleteOneDisplay(){
    if(isError()) clearDisplay();

    var e = displayField.value;
    if(e.length == 1) {
        displayField.value = '0';
        return;
    }
    if(['+','-','×','/'].includes(e[e.length-1])){
        isLastCharOp = false;
    }
    if(['+','-','×','/'].includes(e[e.length-2])){
        isLastCharOp = true;
    }

    displayField.value = e.substr(0,e.length-1);
    displayField.scrollLeft = displayField.scrollWidth;
}

function calculateResult(){
    try{

        navigator.vibrate([70])
        isLastCharOp = false;

        var res = displayField.value;

        res = res.replace('×','*');

        //single percentage
        while(res.search(/([\d\.]+)(\%)/g,"$1/100") == 0){
            var e =res.match(/([\d\.]+)(\%)/);
            e = eval(e[1]+"/100");

            res = res.replace(/([\d\.]+)(\%)/,e);
        }
        

        //calculating percentage
        var percentRegExp = /([\d\.\+\-\*\/]+)(\+|\-)([\d\.]+)(\%)/;

        while(res.search(percentRegExp)>=0) {
            var e = res.match(percentRegExp);
            e = eval("("+e[1]+")*"+e[3]+"/100");

            res = res.replace(percentRegExp,"$1$2"+e);
        }	
        
        res = Math.floor(eval(res)*Math.pow(10,9))/Math.pow(10,9);

        displayField.value = res;

    }catch(err){

        console.log(err)
        displayField.value = "ERROR";
    }
}

(async function(){
    // Registering ServiceWorker
    if(!navigator.serviceWorker) return;
    
    var reg = await navigator.serviceWorker.register('serviceWorker.js');

    // console.log(reg)

})();

(function (window){
    // installation prompt
	let deferredPrompt;

	function addToHomeScreen(e){

		deferredPrompt.prompt();

		deferredPrompt.userChoice.then((choiceResult) => {
			if(choiceResult.outcome === 'accepted'){
				//console.log('User accept to add to home screen')
			}

			deferredPrompt = null;
		})
	}

	async function showInstallAppForm(e){
		deferredPrompt = e;
	}

	window.addEventListener('beforeinstallprompt',async (e)=>{
		// console.log('before Install Prompt')

		if('getInstalledRelatedApps' in navigator){

			navigator.getInstalledRelatedApps().then((result) => {
				
				if(result.length == 0){
					showInstallAppForm(e);
				}
			});
		}
	});

	window.addEventListener('appinstalled',(evt) => {
		//hide Button
		app.logEvent('a2hs','installed')
	});
})(window);