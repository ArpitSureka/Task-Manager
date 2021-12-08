const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomeEmail = (email,name)=>{
    sgMail.send({
        to : email,
        from : 'surekaarpit@gmail.com',
        subject : 'Thanks for joining in!',
        text : `Welcome to the Task Manager app, ${name} Let me know how you get along with the app`
    })
}

const sendGoodbyeEmail = (email,name)=>{
    sgMail.send({
        to : email,
        from : 'surekaarpit@gmail.com',
        subject : 'Sad to see you go',
        text : `Goodbye, ${name} Please tell us what went wrong and how could we have improved your experience`
    })
}


module.exports = {
    sendWelcomeEmail,
    sendGoodbyeEmail
}