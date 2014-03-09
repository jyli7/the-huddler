class Huddle
  include Mongoid::Document

  field :invited_tokens, type: Array, default: []
  field :voted_tokens, type: Array, default: []

  embeds_many :nominations

  def invite_this_email!(email)
  	self.add_token!
  	# Email person here, with token
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
  	self.voted_tokens ||= []
  	self.voted_tokens.push(token)
  end

  def exhaust_token!(token)
    self.exhaust_token(token)
    self.save!
  end

  def invited_this_token?(token)
  	self.invited_tokens.include?(token)
  end

  def token_exhausted?(token)
  	self.voted_tokens.include?(token)
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

  	def generate_invite_token
	  	token = loop do
	      random_token = SecureRandom.urlsafe_base64(nil, false)
	      break random_token unless self.invited_tokens.include?(random_token)
	    end
    end
end
