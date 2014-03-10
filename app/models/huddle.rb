class Huddle
  include Mongoid::Document

  field :invite_tokens,         type: Array, default: []
  field :exhausted_tokens,      type: Array, default: []
  field :invited_emails,        type: Array, default: []
  field :creator_email,         type: String
  field :creator_invite_token,  type: String

  embeds_many :nominations

  after_create :invite_creator
  after_update :alert_all_voters, if: :huddle_just_completed?

  def invite_voter(invitee_email)
    if !self.invited_emails.include?(invitee_email)
      self.add_to_invited_emails(invitee_email)
      self.add_token_for(invitee_email)
      self.email_invitee(invitee_email)
      self.save!
    else
      raise "You already invited this voter"
    end
  end

  def add_to_invited_emails(email)
    self.invited_emails ||= []
    if !self.invited_emails.include?(email)
      self.invited_emails.push(email)
    end
  end

  def email_invitee(email)
    UserMailer.email_invite(email, self, self.invite_token_for(email)).deliver
  end

  def email_completion_notice(email)
    UserMailer.email_completion_notice(email, self, self.invite_token_for(email)).deliver
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
    unless exhausted_this_token?(token)
      self.exhausted_tokens.push(token)
    end
  end

  def exhaust_token!(token)
    self.exhaust_token(token)
    self.save!
  end

  def invited_this_token?(token)
  	self.invite_tokens.include?(token)
  end

  def exhausted_this_token?(token)
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
    self.invited_emails.each do |email|
      self.email_completion_notice(email)
    end
  end

  def completed?
    invite_tokens.length > 0 && exhausted_tokens.length > 0 &&
    outstanding_invitees == 0
  end

  def outstanding_invitees
    invite_tokens.length - exhausted_tokens.length
  end

  protected

    def huddle_just_completed?
      completed? && exhausted_tokens_changed?
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
