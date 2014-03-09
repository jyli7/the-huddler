class Huddle
  include Mongoid::Document

  field :invited_emails, type: Array, default: []
  field :voter_emails, type: Array, default: []

  embeds_many :nominations

  def add_invitee_email!(email)
  	self.invited_emails ||= []
  	self.invited_emails.push(email)
  	self.save!
  end

  def add_voter_email!(email)
  	self.voter_emails ||= []
  	self.voter_emails.push(email)
  	self.save!
  end

  def invited_this_voter?(email)
  	self.invited_emails.include?(email)
  end

  def already_voted?(email)
  	self.voter_emails.include?(email)
  end

  def submit_votes!(voter_email, nom_votes_hash)
  	self.nominations.each do |nom|
  		if nom_votes_hash[nom.id].present?
	  		nom_score = nom_votes_hash[nom.id].to_i
	  		nom.add_to_score!(nom_score)
	  	end
  	end
  	self.add_voter_email!(voter_email)
  end
end
