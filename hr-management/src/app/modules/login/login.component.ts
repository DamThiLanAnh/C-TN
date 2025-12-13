import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { finalize } from 'rxjs/operators';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  loginForm!: FormGroup;
  loginError = false;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
  }

  ngOnInit() {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  isInvalid(control: string): boolean {
    const field = this.loginForm.get(control);
    return !!field && field.invalid && (field.dirty || field.touched);
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const {username, password} = this.loginForm.value;
    console.log('🚀 Starting login process for user:', username);

    this.isLoading = true;
    this.loginError = false;

    this.authService.login(username, password)
      .pipe(
        finalize(() => {
          // Đảm bảo isLoading luôn được set false kể cả khi có lỗi
          this.isLoading = false;
        })
      )
      .subscribe({
        next: (response) => {
          console.log('✅ Login successful, response:', response);

          // Sử dụng method saveTokens từ authService
          this.authService.saveTokens(response);

          // Kiểm tra token đã được lưu chưa
          const savedToken = localStorage.getItem('token');
          const savedRefreshToken = localStorage.getItem('refreshToken');
          console.log('💾 Token after save:', savedToken ? 'EXISTS' : 'NULL');
          console.log('💾 RefreshToken after save:', savedRefreshToken ? 'EXISTS' : 'NULL');
          console.log('💾 Token value:', savedToken);
          console.log('💾 isLoggedIn:', this.authService.isLoggedIn());

          this.loginError = false;

          // Delay nhỏ để đảm bảo token đã được lưu
          setTimeout(() => {
            console.log('🔄 Navigating to /welcome');

            // Chuyển hướng đến trang welcome
            this.router.navigate(['/welcome']).then(
              (success) => {
                console.log('✅ Navigation success:', success);
                if (!success) {
                  console.error('❌ Navigation failed - route might be blocked');
                  console.error('Current URL:', this.router.url);
                  console.error('Router config:', this.router.config);
                }
              },
              (error) => {
                console.error('❌ Navigation error:', error);
              }
            );
          }, 100);
        },
        error: (error) => {
          console.error('❌ Login failed:', error);
          console.error('Error details:', {
            status: error.status,
            message: error.message,
            error: error.error
          });

          this.loginError = true;
        }
      });
  }
}
