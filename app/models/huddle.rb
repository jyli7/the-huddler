class Huddle
  include Mongoid::Document

  field :invited_tokens,        type: Array, default: []
  field :creator_invite_token,  type: String
  field :invited_emails,        type: Array, default: []
  field :exhausted_tokens,       type: Array, default: []

  embeds_many :nominations

  before_create :set_creator_invite_token

  def invite_this_email!(email)
    self.invited_emails ||= []
    if !self.invited_emails.include?(email)
      self.add_token
      self.invited_emails.push(email)
      UserMailer.email_invite(email, self, self.invited_tokens.last).deliver
      self.save!
    end
  end

  def add_token
    self.invited_tokens ||= []
    self.invited_tokens.push(generate_invite_token)
  end

  def add_token!
    self.add_token
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
  	self.invited_tokens.include?(token)
  end

  def token_exhausted?(token)
  	self.exhausted_tokens.include?(token)
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

  protected

    def set_creator_invite_token
      self.creator_invite_token = generate_invite_token
      self.invited_tokens ||= []
      self.invited_tokens.push(self.creator_invite_token)
    end

  	def generate_invite_token
	  	token = loop do
	      random_token = SecureRandom.urlsafe_base64(nil, false)
	      break random_token unless self.invited_tokens.include?(random_token)
	    end
    end
end
