
//this is the most important input has it will measure the amount
//of light hitting the "work"
int luxmeter = A0;
int button = D2;
int luxpot = A1;

void setup() {

  pinMode(luxmeter, INPUT);
  pinMode(button, INPUT);
  pinMode(luxpot, INPUT);

  Serial.begin(9600);

  while(!Serial) {
    ;;
  }
}

void loop() {

  int luxval = analogRead(luxmeter);
  int buttonval = digitalRead(button);
  int timeval = analogRead(luxpot);


  Serial.println("LuxVal");
  delay(100);
  Serial.println(luxval);
  //was having trouble with p5.serial control crashing. added delay
  //slowed information beings send and solved my problem
  delay(100);
  Serial.println("reset");
  delay(100);
  Serial.println(buttonval);
  delay(100);
  Serial.println("luxtime");
  delay(100);
  Serial.println(timeval);
  delay(100);

}
