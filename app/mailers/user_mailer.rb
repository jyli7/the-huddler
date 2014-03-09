class UserMailer < ActionMailer::Base
  default from: "huddles@thehuddler.com"

  def email_invite(email, huddle, token)
  	@huddle = huddle
  	@token = token
  	mail(to: email, subject: "You're invited to a huddle!")
  end

  def email_completion_notice(email, huddle, token)
  	@huddle = huddle
  	@token = token
  	mail(to: email, subject: "Huddle's over! Check out the results.")
  end
end
