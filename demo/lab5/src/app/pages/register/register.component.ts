import { Component, OnInit} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  finalResponseRegister: string | null = null;
  finalResponseLogin: string | null = null;

  constructor(private http: HttpClient, private router: Router) { }

  ngOnInit(): void {
  }

  register() {
    const wrapperElement = document.querySelector('.wrapper');

    const registerENDPOINT = 'http://localhost:8083/user/register';

    const email = document.getElementById('email-register') as HTMLInputElement;
    const emailValue = email.value;
    const password = document.getElementById('password-register') as HTMLInputElement;
    const passwordValue = password.value;
    const country = document.getElementById('country-register') as HTMLInputElement;
    const countryValue = country.value;

    const formData = {
      "email": emailValue,
      "password": passwordValue,
      "natalCountry": countryValue
    };


    this.http.post(registerENDPOINT, formData).subscribe(
      response => {
        this.finalResponseRegister = "Succesfully registered!";
        setTimeout(() => {
          wrapperElement.classList.remove('active');
        }, 2000);
      },
      error => {
        this.finalResponseRegister = "Failed to register! Email used";
      }
    )
  }

  login() {
    const loginENDPOINT = 'http://localhost:8083/user/login';

    const email = document.getElementById('email-login') as HTMLInputElement;
    const emailValue = email.value;
    const password = document.getElementById('password-login') as HTMLInputElement;
    const passwordValue = password.value;

    console.log(emailValue);
    console.log(passwordValue);

    const formData = {
      "email": emailValue,
      "password": passwordValue
    };

    console.log(formData);

    this.http.post(loginENDPOINT, formData).subscribe(
      (response : any) => {
        console.log(response);
        if (response.email != "wrong") {
          this.finalResponseLogin = "Succesfully logon!";
           setTimeout(() => {
          this.router.navigate(['/map'])
        }, 2000);
        } else {
          this.finalResponseLogin = "Email / Password are wrong!";

        }
      }
    )

    console.log(this.finalResponseLogin);
  }

  switchLoginLink() {
    const wrapperElement = document.querySelector('.wrapper');

    if (wrapperElement) {
      wrapperElement.classList.remove('active');
    }
  }

  switchRegisterLink() {
    const wrapperElement = document.querySelector('.wrapper');

    if (wrapperElement) {
      wrapperElement.classList.add('active');
    }
  }

  toggleLogin(){
    const wrapperElement = document.querySelector('.wrapper');

    if (wrapperElement) {
      wrapperElement.classList.add('active-popup');
      wrapperElement.classList.remove('active');
    }
  }

  closeLogin() {
    const wrapperElement = document.querySelector('.wrapper');

    if (wrapperElement) {
      wrapperElement.classList.remove('active-popup');
    }
  }
}
