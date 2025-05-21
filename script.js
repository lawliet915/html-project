const myButton = document.getElementById('myButton');
let clickCount = 0;

myButton.addEventListener('click', function() {
    clickCount++;
    console.log(`clicked ${clickCount} times!`);
});