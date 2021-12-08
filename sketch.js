//Special thanks to Andrew Cotter for Basic Serial Startup code
//and assisting in how to establish multiple serial inputs, p5.js Sound Library, and Gregor Aisch's chroma
//Sound Effect:
//"doorbellish.flac" by Timber
//https://freesound.org/people/Timbre/sounds/116427/

// Declare a "SerialPort" object
let serial;
// fill in the name of your serial port here:
let portName = "/dev/tty.usbmodem1401";

//variable for alarm sound to play when timer hits 0
let alarm

//this will be the value taken by the Arduino's photoresistor
let luxval = 0;

//establishing the variable for the arc that visualizes the timer 
let arc1 = 0
//establishing variable to monitor how much time has passed
let timer

//this will be time passed * luxval
let exposure
//i want this value to be manipulated by a potentiometer
let maxtime = 250
//will dictate when the timer is done
let timeleft
//to help restart the sketch
let reset

//toying with buttons and inputs
//resets the sketch
let resetbutton

//trying to unput the name of the piece but I am having trouble with the button function
let namebutton
let nameinput


let varMode = "none";

function setup() {
  //I want this sketch to work on any monitor, since I imagine it would be used in a
  //museum and they might have varying screen sizes 
  createCanvas(windowWidth, windowHeight);
  
  //original input and button code help found here: https://p5js.org/examples/dom-input-and-button.html
  resetbutton = createButton("Reset")
  resetbutton.position(width/2-resetbutton.width/2, height*.95)
  resetbutton.mousePressed(resetsketch)

  //can't get the input button to work
  // namebutton = createButton("Enter Work")
  // namebutton.position(1, height-25)
  // namebutton.mousePressed(workname)
  nameinput = createInput()
  // nameinput.position(2, height-25)
  
  //use this song to denote when time is up
  alarm = loadSound("116427__timbre__doorbellish.flac")
  
  //I think better in degrees rather than radians XD
  angleMode(DEGREES)
  textAlign(CENTER, CENTER)

  if (reset != 0) {
    resetsketch()
  } 

  // make an instance of the SerialPort object
  serial = new p5.SerialPort();

  // Get a list the ports available
  serial.list();

  // Assuming our Arduino is connected, open the connection to it
  serial.open(portName);

  // When you get a list of serial ports that are available
  serial.on("list", gotList);

  // When you some data from the serial port
  serial.on("data", gotData);

}

// Got the list of ports
function gotList(thelist) {
  print("List of Serial Ports:");
  // theList is an array of their names
  for (let i = 0; i < thelist.length; i++) {
    // Display in the console
    print(i + " " + thelist[i]);
  }
}

// Called when there is data available from the serial port
function gotData() {
  // read the incoming data
  let currentString = serial.readLine();

  // trim off trailing whitespace
  trim(currentString);

  // if the incoming string is empty, do no more
  if (!currentString) return;

  console.log(currentString);

  if (isNaN(currentString)) {
    varMode = currentString
    } else {
    //maps the incoming luxvalue from 0 to 20, a bit of an arbitrary pick on my part
    switch(varMode){
      case "LuxVal":
        luxval = map(currentString, 0, 1023, 0, 20);
        break;
    //reads the value of the digital input from the button
      case "reset":
        reset = currentString
        break;
    //reading the potentiometer to dictate how long the exposure should be
    //again, an somewhat arbitrary pick on my part
      case "luxtime":
        maxtime = round(map(currentString, 0, 1023, 0, 500))
        break;
    }
  }
}

function draw() {
  //background color adjusted by light intensity, fun way to utilize chroma.js 
  //temperature function
  background(chroma.temperature(map(luxval, 0, 20, 3000, 6500)).rgb());
  // console.log(luxval)

  //leanred not to tie the timer variable to this fixed values, and learned the "if" statement
  //works much better. the modulo values helped smooth everything
  //stops the timer if there is no luxval since 0 lux ostensibly means the time can be infinite
  if (luxval > 0) {
    if ((millis()*1000)%1 === 0) {
      timer += .016
  } else {
    timer += 0 
  }
}
  
  //reset button works to restart sketch while it's looping
  //trying to figure out how to restart sketch when not looping
  if (reset != 0) {
    resetsketch()
  }

  fill(chroma('crimson').rgb())
  stroke(255)
  strokeWeight(10)
  ellipse(width/2, height/2, width/3, width/3)

  
  //the arc that will deplete to represent the timer
  arc1 = map(exposure, 0, maxtime, 0, 360)
  fill(chroma('green').rgb())
  arc(width/2, height/2, width/3, width/3, 360, 0-arc1)


  //I started with a rectangle but i think an arc will represent a clock better
  // if (rectX < width*(2/3)) {
  //   fill(chroma("chartreuse").rgb())
  // } else {
  //   fill(timercolor(rectX/width).rgb())
  // }
  // rect(0, height/1.1, rectX, height)


  stroke(0)
  strokeWeight(3)
  fill(255)
  textSize(30)
  text("Current Lux: " + round(luxval), width*.5, height*.87)

  stroke(0)
  strokeWeight(3)
  fill(255)
  textSize(30)
  text("Alloted Exposure for " + nameinput.value() + ": " + maxtime, width*.5, height*.92)


  //TEST the reset button
  // fill(255)
  // textSize(30)
  // text("Reset Value: " + reset, width*.25, height*.75)
  // text("Reset Value: " + name, width*.25, height*.75)

  //timer = millis()/1000
  //millis was not working out since it was a fixed value so I switched to the above
  //modulo if statement
  

  exposure = luxval * timer
  timeleft = maxtime-exposure

  //TEST CODE WITHOUT ARDUINO
  // exposure = 2 * millis()/1000
  

  //Easily readable text for the user to know how bright the current environment is
  fill(255)
  textSize(30)
  text("Time Left (Seconds) at Current Lux", width/2, height*.1)

  //places the Time Left right in the middle of the countdown clock for easy visibility
  fill(0)
  stroke(255)
  strokeWeight(2)
  textSize(100)
  text(round(timeleft), width/2, height/2)

//stops the sketch when the timer is done
//trying to figure out how to start the sketch
  if (timeleft <= 0) {
    stopdraw() } else {
      loop()
    }
}

//testing how to start loop back up using my resetsketch function and keypress
function keyPressed() {
  if (keyCode === BACKSPACE) {
  resetsketch()
  }
}

function resetsketch() {
  alarm.stop()
  timer = 0
  loop()
}

function stopdraw () {
  noLoop()
  alarm.loop()
  
}

//can't get the input button to work! 
// function workname() {
//   const name = nameinput.value()
//   stroke(0)
//   strokeWeight(3)
//   fill(255)
//   textSize(30)
//   text("Alloted Exposure for " + name + ": " + maxtime, width*.5, height*.90)
// }