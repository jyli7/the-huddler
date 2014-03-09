class Huddle
  include Mongoid::Document

  field :invite_tokens,        type: Array, default: []
  field :exhausted_tokens,      type: Array, default: []
  field :invited_emails,        type: Array, default: []
  field :creator_email,         type: String
  field :creator_invite_token,  type: String

  embeds_many :nominations

  after_create :invite_creator
  after_update :alert_all_voters, if: :huddle_just_completed?

  def add_to_invited_emails(email)
    self.invited_emails ||= []
    if !self.invited_emails.include?(email)
      self.invited_emails.push(email)
    end
  end

  def email_invitee(email)
    UserMailer.email_invite(email, self, self.invite_token_for(email)).deliver
  end

  def add_token_for(email)
    self.invite_tokens ||= []
    self.invite_tokens.push(generate_invite_token_for(email))
  end

  def add_token_for!(email)
    self.add_token(email)
    self.save!
	end

  def exhaust_token(token)
  	self.exhausted_tokens ||= []
  	self.exhausted_tokens.push(token)
  end

  def exhaust_token!(token)
    self.exhaust_token(token)
    self.save!
  end

  def invited_this_token?(token)
  	self.invite_tokens.include?(token)
  end

  def token_exhausted?(token)
  	self.exhausted_tokens.include?(token)
  end

  def invite_token_for(email)
    self.invite_tokens.detect{|it| it.split('--')[0] == email}
  end

  def submit_votes!(invite_token, votes_hash)
    votes_hash.each_pair do |id, score|
      if id && score
        nom = self.nominations.find(id)
        nom.total_score += score.to_i
      end
    end
    self.exhaust_token(invite_token)
    self.save!
  end

  def alert_all_voters

  end

  protected

    def huddle_just_completed?
      invite_tokens.length > 0 && exhausted_tokens.length > 0 &&
      invite_tokens.length == exhausted_tokens.length &&
      exhausted_tokens.changed?
    end

    def invite_creator
      self.add_to_invited_emails(self.creator_email)
      self.set_creator_invite_token
      self.save!
    end

    def set_creator_invite_token
      self.creator_invite_token = generate_invite_token_for(self.creator_email)
      self.invite_tokens ||= []
      self.invite_tokens.push(self.creator_invite_token)
    end

  	def generate_invite_token_for(email)
	  	token = loop do
	      random_token = SecureRandom.urlsafe_base64(nil, false)
	      break random_token unless self.invite_tokens.include?(random_token)
	    end
      "#{email}--#{token}"
    end
end
