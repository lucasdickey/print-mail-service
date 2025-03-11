# Print Mail Service

A modern web application that allows users to upload PDF documents, process payments, and send physical mail through the Lob API.

![Print Mail Service](https://i.imgur.com/example-image.png)

## 🚀 Features

- **PDF Document Upload**: Upload PDF documents to AWS S3
- **Payment Processing**: Secure payment handling with Stripe
- **Physical Mail Delivery**: Send physical mail through Lob's API
- **Order Tracking**: Track your mail orders with unique IDs
- **Modern UI**: Clean, responsive interface built with Next.js and Tailwind CSS

## 📋 Prerequisites

Before you begin, ensure you have the following:

- Node.js 18.x or higher (specified in `.nvmrc`)
- AWS account with S3 bucket configured
- Stripe account for payment processing
- Lob account for mail delivery services
- Git for version control

## 🔧 Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```
# AWS Configuration
AWS_REGION=your-aws-region
AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key
AWS_S3_BUCKET=your-s3-bucket-name

# Stripe Configuration
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key

# Lob Configuration
LOB_API_KEY=your-lob-api-key
```

## 🛠️ Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/print-mail-service.git
   cd print-mail-service
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## 📝 S3 Bucket Policy

For Lob to access your uploaded PDF files, ensure your S3 bucket has the appropriate policy. The bucket policy should allow public read access for files in the pdfs directory without referrer restrictions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadForLob",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::your-bucket-name/pdfs/*"
    }
  ]
}
```

## 🏗️ Project Structure

```
print-mail-service/
├── app/                   # Next.js app directory
│   ├── api/               # API routes
│   │   ├── send-mail/     # Lob API integration
│   │   └── upload-file/   # S3 upload functionality
│   ├── layout.tsx         # Root layout component
│   └── page.tsx           # Home page
├── components/            # Reusable UI components
├── public/                # Static assets
├── .env.local             # Environment variables (not tracked by git)
├── .nvmrc                 # Node.js version specification
├── package.json           # Project dependencies
├── tailwind.config.js     # Tailwind CSS configuration
└── vercel.json            # Vercel deployment configuration
```

## 🚢 Deployment

This application is configured for deployment on Vercel:

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Configure environment variables in Vercel dashboard
4. Deploy!

## 🧪 Testing

Run the test suite with:

```bash
npm test
```

## 📚 Tech Stack

- **Frontend**: Next.js, React 18, Tailwind CSS
- **Backend**: Next.js API Routes
- **Storage**: AWS S3
- **Payment**: Stripe
- **Mail Service**: Lob
- **Deployment**: Vercel

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
